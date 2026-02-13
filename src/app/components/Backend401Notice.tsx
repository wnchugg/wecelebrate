import { Info, ExternalLink } from 'lucide-react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export function Backend401Notice() {
  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : '';

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-900 mb-2">
            Understanding the 401 Error
          </h3>
          <div className="text-xs text-blue-800 space-y-2">
            <p>
              When you see a <strong>401 Unauthorized</strong> error during backend connection checks, it typically means:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The Edge Function is not deployed to project <code className="bg-white px-1.5 py-0.5 rounded font-mono">{projectId}</code></li>
              <li>Supabase returns 401/403 for non-existent Edge Functions (not 404)</li>
              <li>This is expected behavior when the backend isn't set up yet</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="font-semibold mb-2">✅ How to Fix:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Show Deployment Guide" above for step-by-step instructions</li>
                <li>Or visit the <a 
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                >
                  Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a> to deploy manually</li>
                <li>Alternative: Switch to Production environment if backend is deployed there</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}