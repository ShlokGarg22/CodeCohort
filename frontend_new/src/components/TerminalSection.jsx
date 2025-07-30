import React, { useState, useEffect } from 'react';
import { terminalMessages } from '../data/mock';

const TerminalSection = () => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentMessageIndex < terminalMessages.length) {
      const currentMessage = terminalMessages[currentMessageIndex];
      
      if (currentCharIndex < currentMessage.length) {
        const timer = setTimeout(() => {
          setCurrentCharIndex(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        // Message complete, move to next after delay
        const timer = setTimeout(() => {
          setDisplayedMessages(prev => [...prev, currentMessage]);
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [currentMessageIndex, currentCharIndex]);

  const getCurrentDisplay = () => {
    if (currentMessageIndex < terminalMessages.length) {
      return terminalMessages[currentMessageIndex].substring(0, currentCharIndex);
    }
    return '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-16 px-6">
      <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-800">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-sm text-gray-400 font-mono">terminal</span>
        </div>
        
        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm min-h-[200px]">
          {displayedMessages.map((message, index) => (
            <div key={index} className="text-green-400 mb-2 opacity-80">
              {message}
            </div>
          ))}
          {currentMessageIndex < terminalMessages.length && (
            <div className="text-green-400 mb-2">
              {getCurrentDisplay()}
              <span className="animate-pulse">|</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalSection;