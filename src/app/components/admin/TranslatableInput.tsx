import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { languages } from '../../context/LanguageContext';

export interface TranslatableInputProps {
  label: string;
  value: Record<string, string>; // { en: "text", es: "texto" }
  onChange: (language: string, value: string) => void;
  availableLanguages: string[];
  defaultLanguage: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export function TranslatableInput({
  label,
  value,
  onChange,
  availableLanguages,
  defaultLanguage,
  required = false,
  maxLength,
  placeholder = '',
}: TranslatableInputProps) {
  const [activeTab, setActiveTab] = useState(defaultLanguage);
  const [copiedLanguage, setCopiedLanguage] = useState<string | null>(null);

  // Sort languages to show default first
  const sortedLanguages = [...availableLanguages].sort((a, b) => {
    if (a === defaultLanguage) return -1;
    if (b === defaultLanguage) return 1;
    return 0;
  });

  // Get language info
  const getLanguageInfo = (code: string) => {
    return languages.find((lang) => lang.code === code);
  };

  // Get translation status
  const getStatus = (languageCode: string) => {
    const text = value[languageCode] || '';
    const isDefault = languageCode === defaultLanguage;
    
    if (text.trim()) {
      return 'translated';
    } else if (isDefault && required) {
      return 'required';
    } else {
      return 'empty';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'translated':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'required':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'empty':
        return 'text-gray-400 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'translated':
        return <Check className="w-3 h-3" />;
      case 'required':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Copy from default language
  const handleCopyFromDefault = (targetLanguage: string) => {
    const defaultText = value[defaultLanguage] || '';
    onChange(targetLanguage, defaultText);
    setCopiedLanguage(targetLanguage);
    setTimeout(() => setCopiedLanguage(null), 2000);
  };

  // Handle input change
  const handleInputChange = (languageCode: string, newValue: string) => {
    // Enforce maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange(languageCode, newValue);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Language tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {sortedLanguages.map((languageCode) => {
            const langInfo = getLanguageInfo(languageCode);
            const status = getStatus(languageCode);
            const isActive = activeTab === languageCode;
            const isDefault = languageCode === defaultLanguage;

            return (
              <button
                key={languageCode}
                onClick={() => setActiveTab(languageCode)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg">{langInfo?.flag}</span>
                <span>{langInfo?.name}</span>
                {isDefault && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    Default
                  </span>
                )}
                <span
                  className={`
                    flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border
                    ${getStatusColor(status)}
                  `}
                >
                  {getStatusIcon(status)}
                  {status === 'translated' && 'Done'}
                  {status === 'required' && 'Required'}
                  {status === 'empty' && 'Empty'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input field */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={value[activeTab] || ''}
            onChange={(e) => handleInputChange(activeTab, e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`
              w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
              ${
                getStatus(activeTab) === 'required'
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }
            `}
          />
        </div>

        {/* Bottom row: Copy button and character count */}
        <div className="flex items-center justify-between">
          {/* Copy from default button */}
          {activeTab !== defaultLanguage && (
            <button
              onClick={() => handleCopyFromDefault(activeTab)}
              disabled={!value[defaultLanguage]?.trim()}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                ${
                  copiedLanguage === activeTab
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-blue-600 hover:bg-blue-50 border border-transparent disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed'
                }
              `}
            >
              {copiedLanguage === activeTab ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy from default
                </>
              )}
            </button>
          )}
          {activeTab === defaultLanguage && <div />}

          {/* Character count */}
          {maxLength && (
            <span className="text-sm text-gray-500">
              {(value[activeTab] || '').length} / {maxLength}
            </span>
          )}
        </div>

        {/* Required field validation message */}
        {getStatus(activeTab) === 'required' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              This field is required in the default language ({getLanguageInfo(defaultLanguage)?.name}).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
