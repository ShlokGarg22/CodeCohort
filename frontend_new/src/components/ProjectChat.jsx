import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chatService';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ProjectChat = ({ projectId }) => {
  const { user } = useAuth();
  const { socket, isAuthenticated, joinProjectRoom, leaveProjectRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const syncTimerRef = useRef(null);

  const syncMessages = async () => {
    try {
      const latest = await chatService.getMessages(projectId, { limit: 200 });
      setMessages((prev) => {
        const map = new Map();
        [...prev, ...latest].forEach(m => { if (m && m._id) map.set(m._id, m); });
        return Array.from(map.values());
      });
      scrollToBottom();
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimer = null;

    if (!projectId || !isAuthenticated) {
      return () => {};
    }

    async function init() {
      try {
        setLoading(true);
        // Join project room for realtime once socket is authenticated
        joinProjectRoom(projectId);
        // Load recent messages
        const history = await chatService.getMessages(projectId, { limit: 200 });
        if (mounted) setMessages(history);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Listen for join acks and errors; retry join on transient auth timing
    const onJoinError = (err) => {
      if (!mounted) return;
      // Retry quickly if auth race condition
      if (!retryTimer) {
        retryTimer = setTimeout(() => {
          joinProjectRoom(projectId);
          retryTimer = null;
        }, 600);
      }
    };
    const onJoinOk = () => {
      // Ensure we’re fully synced after joining the room
      syncMessages();
    };

    if (socket) {
      socket.on('project_room_error', onJoinError);
      socket.on('project_room_joined', onJoinOk);
    }

    init();

    return () => {
      mounted = false;
  if (retryTimer) clearTimeout(retryTimer);
  if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      if (socket) {
        socket.off('project_room_error', onJoinError);
        socket.off('project_room_joined', onJoinOk);
      }
      leaveProjectRoom(projectId);
    };
  }, [projectId, isAuthenticated, socket, joinProjectRoom, leaveProjectRoom]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const onNew = (payload) => {
      if (payload?.projectId !== projectId) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === payload.message?._id);
        return exists ? prev : [...prev, payload.message];
      });
      scrollToBottom();
    };
    const onEdit = ({ projectId: pid, message }) => {
      if (pid !== projectId) return;
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    };
    const onDelete = ({ projectId: pid, messageId }) => {
      if (pid !== projectId) return;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };
    const onTyping = ({ projectId: pid, userId, isTyping }) => {
      if (pid !== projectId || userId === user?._id) return;
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => ({ ...prev, [userId]: false }));
        }, 3000);
      }
    };

    socket.on('message:new', onNew);
    socket.on('message:edit', onEdit);
    socket.on('message:delete', onDelete);
    socket.on('typing:update', onTyping);

    return () => {
      socket.off('message:new', onNew);
      socket.off('message:edit', onEdit);
      socket.off('message:delete', onDelete);
      socket.off('typing:update', onTyping);
    };
  }, [socket, isAuthenticated, projectId, user?._id]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const send = async () => {
    const content = input.trim();
    // If an image is selected, send image (with optional caption)
    if (imageFile) {
      await sendImage();
      return;
    }
    // Otherwise send text-only message
    if (!content) return;
    try {
      if (socket && isAuthenticated) {
        socket.emit('message:send', { projectId, content, mentions: [] });
      } else {
        await chatService.sendMessage(projectId, content);
      }
      setInput('');
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  // Basic validate type/size (<5MB)
  if (!file.type.startsWith('image/')) return;
  if (file.size > 5 * 1024 * 1024) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const sendImage = async () => {
    if (!imageFile) return;
    try {
      setUploading(true);
      // Upload via REST to handle multipart and cloud storage
      const saved = await chatService.sendImageMessage(projectId, imageFile, { content: input.trim() });
      // Optimistic add; de-dup with onNew handler
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === saved?._id);
        return exists ? prev : [...prev, saved];
      });
      setInput('');
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      scrollToBottom();
      // Fallback sync in case any client missed the broadcast
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        syncMessages();
      }, 800);
    } catch (e) {
      console.error('Failed to send image', e);
    } finally {
      setUploading(false);
    }
  };

  const onInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (!socket || !isAuthenticated) return;
    socket.emit('typing:update', { projectId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:update', { projectId, isTyping: false });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[60vh] w-full">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-md">
        {loading && <div className="text-sm text-gray-500">Loading messages...</div>}
        {!loading && messages.length === 0 && (
          <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
        )}
        {messages.map((m) => {
          const senderId = (m.sender && (m.sender._id || m.sender.id)) || m.sender;
          const currentUserId = user?._id || user?.id;
          const mine = senderId && currentUserId && String(senderId) === String(currentUserId);
          return (
            <div key={m._id} className={`flex items-start gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={m.sender?.profileImage} />
                  <AvatarFallback>{(m.sender?.fullName || m.sender?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} border rounded-md p-2 max-w-[80%]`}>
                <div className={`text-xs font-medium ${mine ? 'text-blue-100' : 'text-gray-600'}`}>
                  {mine ? 'You' : (m.sender?.fullName || m.sender?.username || 'User')}
                  {m.edited && <span className={`ml-1 text-[10px] ${mine ? 'text-blue-200' : 'text-gray-400'}`}>(edited)</span>}
                </div>
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="attachment" className="rounded-md max-h-60 w-auto mb-1" />
                )}
                {m.content && (
                  <div className={`text-sm whitespace-pre-wrap break-words ${mine ? 'text-white' : 'text-gray-900'}`}>{m.content}</div>
                )}
              </div>
              {mine && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback>{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        {Object.values(typingUsers).some(Boolean) && (
          <div className="text-xs text-gray-500 mb-1">Someone is typing…</div>
        )}
        <div className="flex gap-2 items-center">
          <label className="px-2 py-2 border rounded-md cursor-pointer text-sm bg-white hover:bg-gray-50">
            Attach
            <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          </label>
          {imagePreview && (
            <div className="flex items-center gap-2">
              <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover rounded" />
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => { if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); setImageFile(null); }}
              >Remove</button>
            </div>
          )}
          <input
            value={input}
            onChange={onInput}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <Button onClick={send} disabled={uploading || (!imageFile && !input.trim())}>
            {imageFile ? (uploading ? 'Uploading...' : 'Send') : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;
