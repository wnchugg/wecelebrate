/**
 * Custom Code Editor Component
 * Requirements: 8.1, 8.2, 8.5
 */

import React, { useState } from 'react';
import { CustomCodeEditorProps, CustomCodeTab } from './types';

export const CustomCodeEditor: React.FC<CustomCodeEditorProps> = ({
  html,
  css,
  javascript,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<CustomCodeTab>('html');

  const handleChange = (value: string) => {
    onChange({ [activeTab]: value });
  };

  const currentValue = activeTab === 'html' ? html : activeTab === 'css' ? css : javascript;

  return (
    <div className="flex flex-col h-full">
      <div className="flex space-x-2 border-b px-6 py-3 bg-gray-50">
        {(['html', 'css', 'javascript'] as CustomCodeTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 rounded-t border-b-2 transition-colors uppercase text-sm
              ${
                activeTab === tab
                  ? 'bg-white border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6">
        <textarea
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full font-mono text-sm border rounded p-4 resize-none"
          placeholder={`Enter ${activeTab.toUpperCase()} code here...`}
        />
      </div>

      <div className="border-t bg-yellow-50 px-6 py-3">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 mb-1">
              Security Warning
            </p>
            <p className="text-sm text-yellow-800">
              Custom code is executed in a sandboxed environment. Ensure all code is safe, tested, and from trusted sources only. 
              Malicious code can compromise data security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
