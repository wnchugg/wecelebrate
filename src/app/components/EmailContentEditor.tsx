import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Code, Eye } from 'lucide-react';

interface EmailContentEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  availableVariables?: string[];
  onInsertVariable?: (variable: string) => void;
  label?: string;
  showLabel?: boolean;
}

export function EmailContentEditor({
  content,
  onChange,
  placeholder = 'Start typing your email...',
  availableVariables = [],
  onInsertVariable,
  label = 'Email Content',
  showLabel = true,
}: EmailContentEditorProps) {
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');

  return (
    <div className="space-y-3">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setEditMode('visual')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              editMode === 'visual'
                ? 'bg-white text-[#D91C81] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => setEditMode('html')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              editMode === 'html'
                ? 'bg-white text-[#D91C81] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4" />
            HTML
          </button>
        </div>
      </div>

      {/* Editor Content */}
      {editMode === 'visual' ? (
        <RichTextEditor
          content={content}
          onChange={onChange}
          placeholder={placeholder}
          availableVariables={availableVariables}
          onInsertVariable={onInsertVariable}
        />
      ) : (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={20}
            className="w-full px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent resize-none"
            spellCheck={false}
          />
          <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Code className="w-3 h-3" />
              <span>Direct HTML editing - Be careful with syntax!</span>
            </div>
            <div className="text-xs text-gray-500">
              {content.length.toLocaleString()} characters
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {editMode === 'visual' ? (
              <Eye className="w-5 h-5 text-blue-600" />
            ) : (
              <Code className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-blue-900 mb-1">
              {editMode === 'visual' ? 'Visual Mode Active' : 'HTML Mode Active'}
            </p>
            <p className="text-xs text-blue-800">
              {editMode === 'visual'
                ? 'Use the toolbar to format text, insert images, create tables, and add variables. Switch to HTML mode for direct code editing.'
                : 'You are editing raw HTML. Changes will be reflected in visual mode. Be careful with syntax to avoid rendering issues.'}
            </p>
          </div>
        </div>
      </div>

      {/* Variable Reference (if available) */}
      {availableVariables.length > 0 && (
        <details className="bg-gray-50 border border-gray-200 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            Available Variables ({availableVariables.length})
          </summary>
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable) => (
                <code
                  key={variable}
                  className="px-2 py-1 text-xs bg-pink-50 text-[#D91C81] border border-pink-200 rounded font-mono"
                >
                  {'{{' + variable + '}}'}
                </code>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
