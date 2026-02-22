import { useState, useMemo } from 'react';
import { Search, Check, Star } from 'lucide-react';
import { languages } from '../../context/LanguageContext';

export interface MultiLanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  defaultLanguage: string;
  onDefaultChange: (language: string) => void;
}

export function MultiLanguageSelector({
  selectedLanguages,
  onChange,
  defaultLanguage,
  onDefaultChange,
}: MultiLanguageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages;
    }
    const query = searchQuery.toLowerCase();
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleLanguageToggle = (languageCode: string) => {
    // Prevent unchecking the default language
    if (languageCode === defaultLanguage && selectedLanguages.includes(languageCode)) {
      return;
    }

    if (selectedLanguages.includes(languageCode)) {
      onChange(selectedLanguages.filter((code) => code !== languageCode));
    } else {
      onChange([...selectedLanguages, languageCode]);
    }
  };

  const handleSetAsDefault = (languageCode: string) => {
    // Ensure the language is selected before setting as default
    if (!selectedLanguages.includes(languageCode)) {
      onChange([...selectedLanguages, languageCode]);
    }
    onDefaultChange(languageCode);
  };

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Available Languages</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedLanguages.length} {selectedLanguages.length === 1 ? 'language' : 'languages'} selected
          </p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Language list */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {filteredLanguages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No languages found matching "{searchQuery}"
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLanguages.map((language) => {
              const isSelected = selectedLanguages.includes(language.code);
              const isDefault = language.code === defaultLanguage;

              return (
                <div
                  key={language.code}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    isDefault ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Checkbox */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleLanguageToggle(language.code)}
                        disabled={isDefault}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>

                    {/* Language info */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{language.name}</span>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <Star className="w-3 h-3 fill-current" />
                              Default
                            </span>
                          )}
                          {language.rtl && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              RTL
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{language.code}</span>
                      </div>
                    </div>
                  </div>

                  {/* Set as default button */}
                  {isSelected && !isDefault && (
                    <button
                      onClick={() => handleSetAsDefault(language.code)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info message */}
      {selectedLanguages.includes(defaultLanguage) && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            The default language ({languages.find((l) => l.code === defaultLanguage)?.name}) cannot be unchecked.
            To change the default language, select a different language and click "Set as default".
          </p>
        </div>
      )}
    </div>
  );
}
