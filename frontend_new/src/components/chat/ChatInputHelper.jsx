import React, { useState } from 'react';
import { Code, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const ChatInputHelper = ({ onInsertCode, className = '' }) => {
  const [showHelper, setShowHelper] = useState(false);

  const insertCodeBlock = (language = '') => {
    const codeTemplate = language 
      ? `@code ${language}\n// Your code here\n`
      : `@code\n// Your code here\n`;
    
    onInsertCode(codeTemplate);
    setShowHelper(false);
  };

  const languages = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
    { name: 'C++', value: 'cpp' },
    { name: 'C', value: 'c' },
    { name: 'HTML', value: 'html' },
    { name: 'CSS', value: 'css' },
    { name: 'SQL', value: 'sql' },
    { name: 'JSON', value: 'json' },
    { name: 'Bash', value: 'bash' }
  ];

  return (
    <div className={className}>
      <Popover open={showHelper} onOpenChange={setShowHelper}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title="Code formatting help"
          >
            <Code size={16} />
            <HelpCircle size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" side="top">
          <div className="space-y-4">
            <div className="text-sm font-medium">Code Formatting Help</div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Quick Insert:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertCodeBlock()}
                    className="text-xs"
                  >
                    Generic Code
                  </Button>
                  {languages.slice(0, 3).map((lang) => (
                    <Button
                      key={lang.value}
                      variant="outline"
                      size="sm"
                      onClick={() => insertCodeBlock(lang.value)}
                      className="text-xs"
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">All Languages:</div>
                <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => insertCodeBlock(lang.value)}
                      className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-left"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Manual Format:</div>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  <div>@code [language]</div>
                  <div className="text-gray-600">your code here</div>
                  <div className="text-gray-600">[empty line to end]</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Start with @code, optionally specify language, then add your code. 
                  End with an empty line or @end.
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Inline Code:</div>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  Use `backticks` for inline code
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatInputHelper;
