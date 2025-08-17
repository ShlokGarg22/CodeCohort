// Language detection patterns
const languagePatterns = {
  javascript: [
    /\b(?:function|const|let|var|class|import|export|async|await)\b/,
    /console\.log/,
    /\.js$|\.jsx$/,
    /=>/
  ],
  python: [
    /\b(?:def|class|import|from|if __name__|print)\b/,
    /\.py$/,
    /#.*$/m,
    /:\s*$/m
  ],
  java: [
    /\b(?:public|private|protected|class|interface|extends|implements)\b/,
    /System\.out\.println/,
    /\.java$/,
    /\bString\b/
  ],
  cpp: [
    /\b(?:#include|using namespace|cout|cin)\b/,
    /\.cpp$|\.hpp$|\.c$|\.h$/,
    /::/,
    /std::/
  ],
  c: [
    /\b(?:#include|printf|scanf|malloc|free)\b/,
    /\.c$|\.h$/,
    /%d|%s|%c/
  ],
  html: [
    /<\/?[a-z][\s\S]*>/i,
    /<!DOCTYPE/i,
    /\.html$/
  ],
  css: [
    /[.#][\w-]+\s*{/,
    /:\s*[\w-]+;/,
    /\.css$/
  ],
  sql: [
    /\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i,
    /\.sql$/
  ],
  json: [
    /^\s*{[\s\S]*}$/,
    /^\s*\[[\s\S]*\]$/,
    /\.json$/
  ]
};

// Auto-detect programming language
export const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return 'text';
  
  const codeLines = code.trim().split('\n');
  const firstLine = codeLines[0]?.toLowerCase() || '';
  
  // Check for explicit language hints in first line
  const explicitHints = {
    '#!/usr/bin/env python': 'python',
    '#!/usr/bin/python': 'python',
    '#!/bin/bash': 'bash',
    '#!/bin/sh': 'bash',
    '<?php': 'php',
    '<!doctype html': 'html',
    '<!DOCTYPE html': 'html'
  };
  
  for (const [hint, lang] of Object.entries(explicitHints)) {
    if (firstLine.includes(hint.toLowerCase())) {
      return lang;
    }
  }
  
  // Score each language based on pattern matches
  const scores = {};
  
  for (const [language, patterns] of Object.entries(languagePatterns)) {
    scores[language] = 0;
    
    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        scores[language] += matches.length;
      }
    }
  }
  
  // Find language with highest score
  const detectedLanguage = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return detectedLanguage && detectedLanguage[1] > 0 ? detectedLanguage[0] : 'text';
};

// Parse message content for code blocks
export const parseMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return [{ type: 'text', content: content || '' }];
  }

  const parts = [];
  const lines = content.split('\n');
  let currentText = '';
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for @code prefix
    if (line.trim().startsWith('@code')) {
      // Save any accumulated text
      if (currentText.trim()) {
        parts.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }
      
      // Check if code is on the same line (single-line format)
      const singleLineMatch = line.match(/@code\s*(\w+)?\s*(.+)/);
      if (singleLineMatch && singleLineMatch[2] && singleLineMatch[2].trim()) {
        // Single-line code block
        const language = singleLineMatch[1] || '';
        const code = singleLineMatch[2].trim();
        const detectedLang = language || detectLanguage(code);
        parts.push({
          type: 'code',
          content: code,
          language: detectedLang
        });
        continue;
      }
      
      // Multi-line code block - extract language if specified after @code
      const langMatch = line.match(/@code\s+(\w+)/);
      codeLanguage = langMatch ? langMatch[1] : '';
      inCodeBlock = true;
      continue;
    }
    
    // Check for end of code block (empty line or @end)
    if (inCodeBlock && (line.trim() === '' || line.trim() === '@end')) {
      if (codeContent.trim()) {
        const detectedLang = codeLanguage || detectLanguage(codeContent);
        parts.push({
          type: 'code',
          content: codeContent.trim(),
          language: detectedLang
        });
      }
      codeContent = '';
      codeLanguage = '';
      inCodeBlock = false;
      continue;
    }
    
    if (inCodeBlock) {
      codeContent += line + '\n';
    } else {
      currentText += line + '\n';
    }
  }
  
  // Handle end of message
  if (inCodeBlock && codeContent.trim()) {
    const detectedLang = codeLanguage || detectLanguage(codeContent);
    parts.push({
      type: 'code',
      content: codeContent.trim(),
      language: detectedLang
    });
  } else if (currentText.trim()) {
    parts.push({ type: 'text', content: currentText.trim() });
  }
  
  // If no parts were created, return original content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: content });
  }
  
  return parts;
};

// Format inline code (single backticks)
export const formatInlineCode = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${code}</code>`;
  });
};
