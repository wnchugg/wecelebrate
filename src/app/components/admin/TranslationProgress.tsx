import { languages } from '../../context/LanguageContext';
import { Check, AlertCircle } from 'lucide-react';

export interface TranslationProgressProps {
  translations: Record<string, Record<string, string>>;
  availableLanguages: string[];
  requiredFields: string[];
}

export function TranslationProgress({
  translations,
  availableLanguages,
  requiredFields,
}: TranslationProgressProps) {
  // Calculate completion percentage for a language
  const calculateCompletion = (languageCode: string): number => {
    if (requiredFields.length === 0) {
      return 100;
    }

    let completedCount = 0;
    for (const field of requiredFields) {
      const fieldTranslations = translations[field];
      if (fieldTranslations && fieldTranslations[languageCode]?.trim()) {
        completedCount++;
      }
    }

    return Math.round((completedCount / requiredFields.length) * 100);
  };

  // Get completed and total counts for a language
  const getCounts = (languageCode: string): { completed: number; total: number } => {
    const total = requiredFields.length;
    let completed = 0;

    for (const field of requiredFields) {
      const fieldTranslations = translations[field];
      if (fieldTranslations && fieldTranslations[languageCode]?.trim()) {
        completed++;
      }
    }

    return { completed, total };
  };

  // Get language info
  const getLanguageInfo = (code: string) => {
    return languages.find((lang) => lang.code === code);
  };

  // Get progress bar color based on completion
  const getProgressColor = (percentage: number): string => {
    if (percentage === 100) {
      return 'bg-green-500';
    } else if (percentage >= 50) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  // Get text color based on completion
  const getTextColor = (percentage: number): string => {
    if (percentage === 100) {
      return 'text-green-700';
    } else if (percentage >= 50) {
      return 'text-yellow-700';
    } else {
      return 'text-red-700';
    }
  };

  // Get background color based on completion
  const getBgColor = (percentage: number): string => {
    if (percentage === 100) {
      return 'bg-green-50 border-green-200';
    } else if (percentage >= 50) {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Translation Progress</h3>
        <p className="text-sm text-gray-600 mt-1">
          Track completion status for each language
        </p>
      </div>

      {/* Progress list */}
      <div className="space-y-3">
        {availableLanguages.map((languageCode) => {
          const langInfo = getLanguageInfo(languageCode);
          const percentage = calculateCompletion(languageCode);
          const { completed, total } = getCounts(languageCode);
          const isComplete = percentage === 100;

          return (
            <div
              key={languageCode}
              className={`p-4 border rounded-lg transition-all ${getBgColor(percentage)}`}
            >
              {/* Language header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{langInfo?.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {langInfo?.name}
                      </span>
                      {isComplete && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <Check className="w-3 h-3" />
                          Complete
                        </span>
                      )}
                      {!isComplete && percentage === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Not started
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {completed} of {total} fields translated
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div className={`text-2xl font-bold ${getTextColor(percentage)}`}>
                  {percentage}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${getProgressColor(
                    percentage
                  )}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary message */}
      {availableLanguages.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {availableLanguages.every((lang) => calculateCompletion(lang) === 100) ? (
              <>
                <Check className="inline w-4 h-4 mr-1" />
                All languages are fully translated! You can publish your changes.
              </>
            ) : (
              <>
                <AlertCircle className="inline w-4 h-4 mr-1" />
                Complete all required fields in your default language before publishing.
                Other languages can be published with partial translations.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
