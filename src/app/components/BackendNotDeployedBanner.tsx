import { AlertTriangle, ExternalLink, Terminal } from 'lucide-react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

export function BackendNotDeployedBanner() {
  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : '';

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Backend Not Deployed</p>
            <p className="text-xs opacity-90">
              The Edge Function 'make-server-6fcaeea3' needs to be deployed to <strong>{env.name}</strong> ({projectId})
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://supabase.com/dashboard/project/${projectId}/functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium transition-colors"
            >
              <Terminal className="w-3 h-3" />
              Deploy Now
            </a>
            <a
              href="https://supabase.com/docs/guides/functions/deploy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}