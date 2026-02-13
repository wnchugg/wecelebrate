import { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { setCurrentEnvironment, getAvailableEnvironments } from '../config/deploymentEnvironments';

export function QuickEnvironmentSwitch() {
  const [isChanging, setIsChanging] = useState(false);
  const environments = getAvailableEnvironments();
  const productionEnv = environments.find(env => env.id === 'production');

  if (!productionEnv || environments.length < 2) {
    return null;
  }

  const switchToProduction = () => {
    if (confirm('Switch to Production environment? This will reload the page.')) {
      setIsChanging(true);
      setCurrentEnvironment('production');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-purple-900 mb-1">
            Quick Fix: Try Production Environment
          </h3>
          <p className="text-xs text-purple-700 mb-3">
            If the backend is already deployed to Production, you can switch environments to test immediately.
          </p>
          <button
            onClick={switchToProduction}
            disabled={isChanging}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isChanging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Switch to Production
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}