import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chatService';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import MessageContent from './chat/MessageContent';
import ChatInputHelper from './chat/ChatInputHelper';

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

  // --- AI content rendering helpers ---
  const renderBold = (text) => {
    const parts = [];
    const regex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(<strong key={`b-${match.index}`} className="font-semibold">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length ? parts : [text];
  };

  const renderInline = (text) => {
    const out = [];
    const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let last = 0;
    let m;
    while ((m = linkRe.exec(text)) !== null) {
      if (m.index > last) {
        const chunk = text.slice(last, m.index);
        out.push(...renderBold(chunk));
      }
      const label = m[1];
      const href = m[2];
      out.push(
        <a
          key={`lnk-${m.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-700 break-words"
        >
          {label}
        </a>
      );
      last = linkRe.lastIndex;
    }
    if (last < text.length) out.push(...renderBold(text.slice(last)));
    return out.length ? out : [text];
  };

  const renderAiContent = (content) => {
    if (!content) return null;
    const lines = String(content).split(/\r?\n/);
    const blocks = [];
    let listItems = [];
    const flushList = () => {
      if (listItems.length) {
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="list-disc pl-5 my-1 space-y-1">
            {listItems.map((t, i) => (
              <li key={`li-${i}`} className="leading-6">{renderInline(t)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };
    lines.forEach((raw, idx) => {
      const line = raw.trimEnd();
      if (!line.trim()) { // blank line -> paragraph break
        flushList();
        blocks.push(<div key={`sp-${idx}`} className="h-2" />);
        return;
      }
      const mHead = line.match(/^(#{1,6})\s+(.+)$/);
      if (mHead) {
        flushList();
        const level = mHead[1].length;
        const txt = mHead[2];
        const size = level <= 2 ? 'text-[15px]' : 'text-[14px]';
        blocks.push(
          <div key={`h-${idx}`} className={`font-semibold ${size} mt-1 mb-1`}>{renderInline(txt)}</div>
        );
        return;
      }
      const mList = line.match(/^[-*]\s+(.+)$/);
      if (mList) {
        listItems.push(mList[1]);
        return;
      }
      // normal paragraph
      flushList();
      blocks.push(
        <p key={`p-${idx}`} className="leading-6">
          {renderInline(line)}
        </p>
      );
    });
    flushList();
    return <div className="space-y-1">{blocks}</div>;
  };

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
    // Preserve internal newlines but trim only spaces/tabs at start/end of each line
    const content = processContent(input);
    
    // If an image is selected, send image (with optional caption)
    if (imageFile) {
      await sendImage();
      return;
    }
    // Otherwise send text-only message
    if (!content) return;
    // If AI command
    if (content.toLowerCase().startsWith('@ai ')) {
      const prompt = content.slice(4).trim();
      if (!prompt) { setInput(''); return; }
      try {
        // First, post the user's question as a normal message (without the @ai prefix)
        if (socket && isAuthenticated) {
          socket.emit('message:send', { projectId, content: prompt, mentions: [] });
        } else {
          await chatService.sendMessage(projectId, prompt);
        }
        // Optimistic "assistant is thinking" placeholder (not persisted)
        const tempId = `temp-ai-${Date.now()}`;
        setMessages((prev) => [...prev, {
          _id: tempId,
          sender: { _id: 'ai', username: 'AI', fullName: 'AI Assistant', profileImage: '' },
          content: 'Thinking…',
          createdAt: new Date().toISOString(),
        }]);
        setInput('');
        const aiText = await chatService.aiPrompt(projectId, prompt, { maxTokens: 4096 });
        // Send as a real message from the requester so it persists for everyone, labeled content with prefix "AI:" on server
        const finalContent = aiText || 'No response';
        if (socket && isAuthenticated) {
          socket.emit('message:send', { projectId, content: `AI: ${finalContent}`, mentions: [] });
        } else {
          await chatService.sendMessage(projectId, `AI: ${finalContent}`);
        }
        // Remove placeholder; actual message will arrive via socket/rest response handlers
        setMessages((prev) => prev.filter(m => m._id !== tempId));
        scrollToBottom();
      } catch (e) {
        // Replace placeholder with error
        setMessages((prev) => prev.map(m => m._id?.startsWith('temp-ai-') ? { ...m, content: 'AI error. Try again later.' } : m));
      }
      return;
    }
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
      // Preserve newlines in image captions too
      const content = processContent(input);
      const saved = await chatService.sendImageMessage(projectId, imageFile, { content });
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
    
    // Auto-resize textarea based on content
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    
    if (!socket || !isAuthenticated) return;
    socket.emit('typing:update', { projectId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:update', { projectId, isTyping: false });
    }, 1000);
  };

  const handleInsertCode = (codeTemplate) => {
    // Code insertion disabled
  };

  // Helper to check if input has any non-whitespace content
  const hasContent = (text) => /\S/.test(text || '');

  // Helper to process input content
  // - Preserve indentation and internal newlines
  // - Remove only leading/trailing blank lines
  const processContent = (text) => {
    if (typeof text !== 'string') return '';
    // Normalize newlines then strip empty lines at the start/end only
    const normalized = text.replace(/\r\n/g, '\n');
    return normalized
      .replace(/^(?:\s*\n)+/, '')   // leading empty lines
      .replace(/(?:\n\s*)+$/, ''); // trailing empty lines
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
          const isAi = String(senderId) === 'ai' || (typeof m.content === 'string' && m.content.startsWith('AI: '));
          const mine = !isAi && senderId && currentUserId && String(senderId) === String(currentUserId);
          const contentToShow = isAi && typeof m.content === 'string' ? m.content.replace(/^AI:\s*/,'') : m.content;
          return (
            <div key={m._id} className={`flex items-start gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <Avatar className="h-8 w-8">
          <AvatarImage src={isAi ? '' : m.sender?.profileImage} />
          <AvatarFallback>{isAi ? 'AI' : (m.sender?.fullName || m.sender?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className={`${mine ? 'bg-blue-600 text-white' : (isAi ? 'bg-violet-50 text-gray-900' : 'bg-white text-gray-900')} border rounded-md p-3 max-w-[80%] min-w-0 chat-message-container overflow-hidden`}>
                <div className={`text-xs font-medium ${mine ? 'text-blue-100' : 'text-gray-600'}`}>
          {mine ? 'You' : (isAi ? 'AI Assistant' : (m.sender?.fullName || m.sender?.username || 'User'))}
                  {m.edited && <span className={`ml-1 text-[10px] ${mine ? 'text-blue-200' : 'text-gray-400'}`}>(edited)</span>}
                </div>
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="attachment" className="rounded-md max-h-60 w-auto mb-1" />
                )}
                {contentToShow && (
                  isAi
                    ? <div className="text-sm prose prose-sm max-w-none [&_a]:break-words">{renderAiContent(contentToShow)}</div>
                    : <MessageContent 
                        content={contentToShow}
                        parts={(m.parsedContent && Array.isArray(m.parsedContent) && m.parsedContent.length) ? m.parsedContent : undefined}
                        className={`text-sm ${mine ? 'text-white' : 'text-gray-900'}`}
                      />
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
          <ChatInputHelper onInsertCode={handleInsertCode} />
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
          <textarea
            value={input}
            onChange={onInput}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                send(); 
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 border rounded-md px-3 py-2 text-sm resize-none min-h-[40px] max-h-[120px] overflow-y-auto chat-input-textarea"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '40px'
            }}
          />
          <Button onClick={send} disabled={uploading || (!imageFile && !hasContent(input))}>
            {imageFile ? (uploading ? 'Uploading...' : 'Send') : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;
