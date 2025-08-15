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
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;
  async function init() {
      try {
        setLoading(true);
        // Join project room for realtime
        joinProjectRoom(projectId);
        // Load recent messages
    const history = await chatService.getMessages(projectId, { limit: 200 });
    if (mounted) setMessages(history);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();

    return () => {
      mounted = false;
      leaveProjectRoom(projectId);
    };
  }, [projectId, joinProjectRoom, leaveProjectRoom]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const onNew = (payload) => {
      if (payload?.projectId !== projectId) return;
      setMessages((prev) => [...prev, payload.message]);
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
    if (!content) return;
    try {
      // Prefer socket realtime if present; backend persists on message:send
      if (socket && isAuthenticated) {
        socket.emit('message:send', { projectId, content, mentions: [] }, (ack) => {
          // Optionally handle ack
        });
      } else {
        await chatService.sendMessage(projectId, content);
      }
      setInput('');
    } catch (e) {
      console.error('Failed to send message', e);
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
          const mine = (m.sender?._id || m.sender) === user?._id;
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
                <div className={`text-sm whitespace-pre-wrap break-words ${mine ? 'text-white' : 'text-gray-900'}`}>{m.content}</div>
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
        <div className="flex gap-2">
          <input
            value={input}
            onChange={onInput}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;
