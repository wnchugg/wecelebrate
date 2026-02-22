
export interface RichTextEditorProps {
  value?: string;
  content?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  availableVariables?: string[];
  onInsertVariable?: (variable: string) => void;
  label?: string;
  showLabel?: boolean;
}

export function RichTextEditor({ 
  value,
  content,
  onChange, 
  placeholder = 'Enter text...', 
  minHeight = '200px',
  className = '',
  availableVariables = [],
  onInsertVariable,
  label = '',
  showLabel = false
}: RichTextEditorProps) {
  const currentValue = content || value || '';
  
  return (
    <div>
      {showLabel && label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <textarea
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none ${className}`}
        style={{ minHeight }}
      />
      {availableVariables.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Available variables: {availableVariables.map(v => `{{${v}}}`).join(', ')}
        </div>
      )}
    </div>
  );
}