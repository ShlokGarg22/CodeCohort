import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ code, language, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={`code-block-container ${className}`}>
      <div className="flex justify-between items-center bg-gray-800 text-white px-3 py-2 rounded-t-md">
        <span className="text-sm font-medium capitalize">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-xs hover:bg-gray-700 px-2 py-1 rounded transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 6px 6px',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={code.split('\n').length > 10}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
