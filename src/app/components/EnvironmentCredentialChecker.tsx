import { useState } from 'react';
import { Key, ChevronDown, ChevronUp } from 'lucide-react';
import { getAvailableEnvironments, setCurrentEnvironment, getCurrentEnvironment, type EnvironmentType } from '../config/deploymentEnvironments';

export function EnvironmentCredentialChecker() {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableEnvironments = getAvailableEnvironments();
  const currentEnv = getCurrentEnvironment();

  const handleSwitchEnvironment = (envId: EnvironmentType) => {
    if (envId !== currentEnv.id) {
      setCurrentEnvironment(envId);
      // Page will reload automatically
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-white hover:text-white/90 text-sm font-medium underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1 flex items-center gap-2 mx-auto"
      >
        <Key className="w-4 h-4" />
        Can't remember which environment?
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 p-5 bg-white rounded-xl border-2 border-blue-200 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Find Your Environment</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Try logging in with each environment to find your credentials. Click "Switch" to change environments.
          </p>

          <div className="space-y-2">
            {availableEnvironments.map((env) => (
              <div
                key={env.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  env.id === currentEnv.id
                    ? 'bg-pink-50 border-[#D91C81]'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span
                    className="px-2.5 py-1 rounded text-xs font-bold border"
                    style={{
                      backgroundColor: env.color + '20',
                      color: env.color,
                      borderColor: env.color,
                    }}
                  >
                    {env.label}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{env.name}</div>
                    <div className="text-xs text-gray-600">{env.description}</div>
                  </div>
                </div>

                {env.id === currentEnv.id ? (
                  <span className="text-xs font-semibold text-[#D91C81] bg-pink-100 px-3 py-1 rounded-full">
                    Current
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSwitchEnvironment(env.id as EnvironmentType)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Switch
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>💡 Tip:</strong> Your password manager might have saved credentials for multiple environments. 
              Switch to each environment and check if your password manager suggests saved credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}