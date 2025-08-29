// Backend code parser utility
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
    /\b(?:#include|printf|scanf|malloc|free|struct|void|int|char|float|double|return)\b/,
    /\.c$|\.h$/,
    /%d|%s|%c/,
    /\bstruct\s+\w+/,
    /\*\w+/,
    /\w+\s*\*\*/
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

const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return 'text';
  
  const codeLines = code.trim().split('\n');
  const firstLine = codeLines[0]?.toLowerCase() || '';
  
  // Check for explicit language hints
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

const parseMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { 
      messageType: 'text', 
      parsedContent: [{ type: 'text', content: content || '' }] 
    };
  }

  // Simply return all content as text - no special @code processing
  return { 
    messageType: 'text', 
    parsedContent: [{ type: 'text', content: content }] 
  };
};module.exports = {
  detectLanguage,
  parseMessageContent
};
