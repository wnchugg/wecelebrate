import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface ProgressStepsProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressSteps({ currentStep, totalSteps = 6 }: ProgressStepsProps) {
  const { t } = useLanguage();
  
  const steps = [
    { number: 1, label: t('progress.landing') || 'Welcome' },
    { number: 2, label: t('progress.validation') || 'Validation' },
    { number: 3, label: t('progress.selection') || 'Select Gift' },
    { number: 4, label: t('progress.details') || 'Gift Details' },
    { number: 5, label: t('progress.shipping') || 'Shipping' },
    { number: 6, label: t('progress.review') || 'Review' },
  ];

  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : step.number === currentStep
                      ? 'bg-[#D91C81] text-white ring-4 ring-pink-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium ${
                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 -mt-6">
                  <div
                    className={`h-full transition-all ${
                      step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`h-2 flex-1 rounded-full transition-all ${
                  step.number < currentStep
                    ? 'bg-green-500'
                    : step.number === currentStep
                    ? 'bg-[#D91C81]'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-gray-700">
              {t('progress.step') || 'Step'} {currentStep} {t('progress.of') || 'of'} {totalSteps}: {steps[currentStep - 1]?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressSteps;