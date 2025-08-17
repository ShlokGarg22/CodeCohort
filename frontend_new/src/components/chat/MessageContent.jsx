import React from 'react';
import CodeBlock from './CodeBlock';
import { parseMessageContent, formatInlineCode } from '../../utils/codeParser';

const MessageContent = ({ content, className = '' }) => {
  const parsedContent = parseMessageContent(content);
  
  return (
    <div className={`message-content ${className}`}>
      {parsedContent.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language}
              className="my-2"
            />
          );
        } else {
          // Handle inline code and regular text
          const formattedText = formatInlineCode(part.content);
          return (
            <div
              key={index}
              className="text-content"
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          );
        }
      })}
    </div>
  );
};

export default MessageContent;
