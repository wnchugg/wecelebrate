import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Server, Globe, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { DEPLOYMENT_ENVIRONMENTS, getCurrentEnvironment, setCurrentEnvironment } from '../../config/deploymentEnvironments';

export function AdminEnvironments() {
  const currentEnv = getCurrentEnvironment();
  const [selectedEnv, setSelectedEnv] = useState(currentEnv.id);

  const handleEnvironmentChange = (envId: string) => {
    setSelectedEnv(envId);
    setCurrentEnvironment(envId);
    // Reload to apply the new environment
    window.location.reload();
  };

  useEffect(() => {
    // Add a listener for the 'beforeunload' event to show a confirmation dialog
    const currentRef = currentEnv.id;
    const currentName = currentEnv.name;
    const currentProjectId = currentEnv.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (selectedEnv !== currentRef) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome
        toast.warning(`You have selected a different environment: ${DEPLOYMENT_ENVIRONMENTS.find(env => env.id === selectedEnv)?.name}. Reload the page to apply the changes.`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedEnv, currentEnv]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Link */}
        <div className="mb-4">
          <Link 
            to="/admin/login"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D91C81] to-[#00B4CC] p-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Environment Selection</h1>
            <p className="text-white/90">Choose which environment to connect to</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Current Environment */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-semibold text-blue-900 mb-2">Currently Connected To:</p>
              <p className="text-lg font-bold text-blue-700">{currentEnv.name}</p>
              <p className="text-xs text-blue-600 mt-1">
                Project ID: {currentEnv.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]}
              </p>
            </div>

            {/* Environment List */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Available Environments:</h2>
              
              {DEPLOYMENT_ENVIRONMENTS.map((env) => (
                <button
                  key={env.id}
                  onClick={() => handleEnvironmentChange(env.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedEnv === env.id
                      ? 'border-[#D91C81] bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className={`w-5 h-5 ${
                        selectedEnv === env.id ? 'text-[#D91C81]' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-semibold ${
                          selectedEnv === env.id ? 'text-[#D91C81]' : 'text-gray-900'
                        }`}>
                          {env.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {env.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Project: {env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]}
                        </p>
                      </div>
                    </div>
                    {selectedEnv === env.id && (
                      <CheckCircle className="w-6 h-6 text-[#D91C81]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs font-semibold text-yellow-900 mb-2">⚠️ Important:</p>
              <div className="text-xs text-yellow-800 space-y-1">
                <p>• Each environment has its own separate database and user accounts</p>
                <p>• Changing environments will reload the page</p>
                <p>• Your credentials are environment-specific</p>
                <p>• Development is the default environment for testing</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <Link
                to="/admin/login"
                className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}