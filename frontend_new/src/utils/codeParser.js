// Simple language detection for basic syntax highlighting
export const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return 'text';
  
  // Basic language detection based on simple keywords
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('function') || lowerCode.includes('const ') || lowerCode.includes('let ') || lowerCode.includes('=>')) {
    return 'javascript';
  }
  if (lowerCode.includes('def ') || lowerCode.includes('import ') || lowerCode.includes('print(')) {
    return 'python';
  }
  if (lowerCode.includes('public class') || lowerCode.includes('system.out')) {
    return 'java';
  }
  if (lowerCode.includes('struct') || lowerCode.includes('malloc') || lowerCode.includes('printf')) {
    return 'c';
  }
  if (lowerCode.includes('#include') || lowerCode.includes('cout') || lowerCode.includes('std::')) {
    return 'cpp';
  }
  if (lowerCode.includes('<html>') || lowerCode.includes('<!doctype')) {
    return 'html';
  }
  
  return 'text';
};

// Parse message content - simplified to treat everything as text
export const parseMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return [{ type: 'text', content: content || '' }];
  }

  // Simply return all content as text - no special @code processing
  return [{ type: 'text', content: content }];
};// Format inline code (single backticks)
export const formatInlineCode = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${code}</code>`;
  });
};
