import React from 'react';
import CodeBlock from './CodeBlock';
import { parseMessageContent } from '../../utils/codeParser';

// Simple message content renderer - no special code block handling
const MessageContent = ({ content, parts, className = '' }) => {
  // Always treat everything as text content
  const textContent = content || '';
  
  return (
    <div className={`message-content ${className} max-w-full overflow-hidden`}>
      <div className="text-content break-words">
        <span className="whitespace-pre-wrap">
          {textContent}
        </span>
      </div>
    </div>
  );
};

export default MessageContent;
