import { Terminal, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { copyToClipboard as copyToClipboardUtil, selectTextInElement as selectTextUtil } from '../utils/clipboard';

export function BackendDeploymentGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [clipboardBlocked, setClipboardBlocked] = useState(false);
  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = urlMatch ? urlMatch[1] : '';

  const copyToClipboard = async (text: string, step: number) => {
    const result = await copyToClipboardUtil(text);
    
    if (result.success) {
      setCopiedStep(step);
      setClipboardBlocked(false);
      setTimeout(() => setCopiedStep(null), 2000);
    } else {
      // Manual copy required - select the text for user
      setClipboardBlocked(true);
      const selected = selectTextUtil(`command-${step}`);
      if (!selected) {
        // Last resort: show alert with text
        alert(`Please manually copy this command:\n\n${text}`);
      }
    }
  };
  
  const deployCommands = [
    {
      title: 'Install Supabase CLI',
      command: 'npm install -g supabase',
      description: 'Install the Supabase CLI globally'
    },
    {
      title: 'Login to Supabase',
      command: 'supabase login',
      description: 'Authenticate with your Supabase account'
    },
    {
      title: 'Deploy Edge Function (One-Line)',
      command: `cd ~/wecelebrate-backend-dev && supabase functions deploy make-server-6fcaeea3 --project-ref ${projectId}`,
      description: `Navigate to project directory and deploy to ${env.name} environment`
    },
    {
      title: 'Set Environment Variables',
      command: `supabase secrets set SUPABASE_URL="${env.supabaseUrl}" SUPABASE_ANON_KEY="${env.supabaseAnonKey.substring(0, 20)}..." SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"`,
      description: 'Configure required environment variables'
    }
  ];

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <Terminal className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">
            Deploy Backend to {env.name} Environment
          </h3>
          <p className="text-sm text-blue-700">
            The Edge Function needs to be deployed to project <code className="bg-white/60 px-2 py-0.5 rounded font-mono">{projectId}</code>
          </p>
        </div>
      </div>

      {clipboardBlocked && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-900">
            <strong>📋 Clipboard blocked:</strong> Your browser has blocked automatic copying. The text is now selected - press <kbd className="bg-white px-1.5 py-0.5 rounded border border-yellow-300 font-mono text-xs">Ctrl+C</kbd> (or <kbd className="bg-white px-1.5 py-0.5 rounded border border-yellow-300 font-mono text-xs">Cmd+C</kbd>) to copy.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {deployCommands.map((cmd, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{cmd.title}</h4>
              </div>
              <button
                onClick={() => void copyToClipboard(cmd.command, index)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Copy command"
              >
                {copiedStep === index ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-2">{cmd.description}</p>
            <pre 
              className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto cursor-text select-all hover:ring-2 hover:ring-blue-400 transition-all" 
              id={`command-${index}`}
              title="Click to select, then Ctrl+C to copy"
            >
              {cmd.command}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important Notes:</p>
        <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
          <li>You need the Supabase Service Role Key from your project settings</li>
          <li>The Edge Function code is located in <code className="bg-white/60 px-1 rounded">/supabase/functions/server/</code></li>
          <li>After deployment, it may take a few seconds for the function to become available</li>
          <li>You can verify deployment in the Supabase Dashboard → Edge Functions</li>
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={`https://supabase.com/dashboard/project/${projectId}/functions`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Supabase Dashboard
        </a>
        <a
          href="https://supabase.com/docs/guides/functions/deploy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Deployment Docs
        </a>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-semibold text-green-900 mb-1">✅ Alternative: Switch Environment</p>
        <p className="text-xs text-green-700">
          If the backend is already deployed to another environment (like Production), you can switch environments using the dropdown at the top of this page.
        </p>
      </div>
    </div>
  );
}