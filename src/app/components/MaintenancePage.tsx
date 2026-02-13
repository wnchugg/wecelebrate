import { useEffect, useState } from 'react';
import { Settings, AlertCircle, Clock, RefreshCw, Mail } from 'lucide-react';

interface MaintenancePageProps {
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Estimated time back online */
  estimatedTime?: string;
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Countdown target (ISO string or timestamp) */
  countdownTarget?: string | number;
  /** Show refresh button */
  showRefreshButton?: boolean;
  /** Contact email for support */
  supportEmail?: string;
  /** Additional custom content */
  children?: React.ReactNode;
  /** Custom maintenance reason */
  reason?: string;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
}

export function MaintenancePage({
  title = 'We\'ll be back soon!',
  message = 'We\'re currently performing scheduled maintenance to improve your experience. We appreciate your patience.',
  estimatedTime,
  showCountdown = false,
  countdownTarget,
  showRefreshButton = true,
  supportEmail = 'support@wecelebrate.com',
  children,
  reason = 'Scheduled maintenance',
  showProgress = false,
  progress = 0,
}: MaintenancePageProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!showCountdown || !countdownTarget) return () => {}; // Return empty cleanup function

    const calculateTimeRemaining = () => {
      const target = typeof countdownTarget === 'string' 
        ? new Date(countdownTarget).getTime() 
        : countdownTarget;
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining('Any moment now...');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [showCountdown, countdownTarget]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header with animated gradient */}
          <div className="relative bg-gradient-to-r from-[#D91C81] to-[#B71569] px-8 py-12 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Icon and Title */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-spin-slow">
                <Settings className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">{title}</h1>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{reason}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
              {message}
            </p>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-[#D91C81]">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D91C81] to-[#B71569] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {showCountdown && timeRemaining && (
              <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-[#D91C81]" />
                  <span className="font-semibold text-gray-900">Estimated Time Remaining</span>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#D91C81] to-[#B71569] bg-clip-text text-transparent">
                    {timeRemaining}
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Time Text */}
            {!showCountdown && estimatedTime && (
              <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-[#D91C81]" />
                  <span className="text-gray-900">
                    <span className="font-semibold">Expected back online:</span> {estimatedTime}
                  </span>
                </div>
              </div>
            )}

            {/* Custom Children Content */}
            {children && (
              <div className="mb-8">
                {children}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {showRefreshButton && (
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D91C81] text-white rounded-lg font-semibold text-lg hover:bg-[#B71569] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Page
                </button>
              )}

              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                >
                  <Mail className="w-5 h-5" />
                  Contact Support
                </a>
              )}
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Thank you for your patience while we make wecelebrate even better.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-[#D91C81] rounded-full animate-pulse"></div>
                  <span>Updates will be posted here</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This maintenance is necessary to ensure the best experience for all users.
          </p>
        </div>
      </div>
    </div>
  );
}

// Utility component for quick maintenance mode
export function QuickMaintenance({ estimatedTime }: { estimatedTime?: string }) {
  return (
    <MaintenancePage
      title="Under Maintenance"
      message="We're making some improvements and will be back shortly."
      estimatedTime={estimatedTime}
      showRefreshButton={true}
    />
  );
}