import React, { useState } from 'react';
import { parseMessageContent } from '../utils/codeParser';
import MessageContent from './chat/MessageContent';

const CodeBlockTest = () => {
  const [input, setInput] = useState('@code javascript//console.log("Shlok Garg")');
  const [output, setOutput] = useState(null);

  const testParsing = () => {
    const parsed = parseMessageContent(input);
    setOutput(parsed);
    console.log('Parsed result:', parsed);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Code Block Parser Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Input:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      
      <button
        onClick={testParsing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
      >
        Test Parsing
      </button>
      
      {output && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Parsed Output (JSON):</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Rendered Output:</h3>
            <div className="border p-4 rounded bg-white">
              <MessageContent content={input} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeBlockTest;
