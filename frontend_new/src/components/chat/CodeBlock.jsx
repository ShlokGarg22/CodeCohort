import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

// Custom theme with better line wrapping
const customTheme = {
  ...vscDarkPlus,
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    wordWrap: 'break-word'
  },
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    overflow: 'hidden'
  }
};

const CodeBlock = ({ code, language, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      // Ensure proper line breaks are preserved when copying
      const formattedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Ensure the code has proper line breaks
  const normalizedCode = typeof code === 'string' ? code.replace(/\\n/g, '\n') : code;

  // If SyntaxHighlighter fails, use a simple pre tag
  const SimpleCodeBlock = () => (
    <pre
      style={{
        margin: 0,
        padding: '12px',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        fontSize: '13px',
        lineHeight: '1.4',
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        overflow: 'auto',
        borderRadius: '0 0 6px 6px',
        maxWidth: '100%'
      }}
    >
      {normalizedCode}
    </pre>
  );

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
      <div className="relative overflow-hidden w-full">
        {/* Always use SyntaxHighlighter for consistent code formatting */}
        <SyntaxHighlighter
          language={language || 'text'}
          style={customTheme}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 6px 6px',
            fontSize: '13px',
            lineHeight: '1.4',
            padding: '12px',
            maxWidth: '100%',
            width: '100%',
            whiteSpace: 'pre',
            fontFamily: 'monospace'
          }}
          showLineNumbers={normalizedCode.split('\n').length > 1}
          wrapLines={false}
          wrapLongLines={false}
          codeTagProps={{
            style: {
              whiteSpace: 'pre',
              wordWrap: 'normal',
              overflowWrap: 'normal'
            }
          }}
        >
          {normalizedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
