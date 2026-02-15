import { useState } from 'react';
import { CheckCircle, Circle, Terminal, Database, Key, TestTube } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  command?: string;
  completed: boolean;
}

export function SetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'create-project',
      title: 'Create Supabase Project',
      description: 'Create a new Supabase project for Development',
      icon: <Database className="w-5 h-5" />,
      completed: false,
    },
    {
      id: 'deploy-function',
      title: 'Deploy Edge Function',
      description: 'Deploy the backend Edge Function to Supabase',
      icon: <Terminal className="w-5 h-5" />,
      command: './scripts/deploy-to-environment.sh dev',
      completed: false,
    },
    {
      id: 'add-credentials',
      title: 'Add Credentials',
      description: 'Add Supabase URL and Anon Key to environment',
      icon: <Key className="w-5 h-5" />,
      completed: false,
    },
    {
      id: 'test-connection',
      title: 'Test Connection',
      description: 'Verify the connection is working',
      icon: <TestTube className="w-5 h-5" />,
      completed: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [showWizard, setShowWizard] = useState(true);

  const markStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    const currentStepIndex = steps.findIndex(s => s.id === stepId);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(currentStepIndex + 1);
    }
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  if (!showWizard) return null;

  const allComplete = steps.every(s => s.completed);

  return (
    <Card className="border-[#D91C81] bg-gradient-to-br from-pink-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-[#D91C81]">
            🚀 First-Time Setup Wizard
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowWizard(false)}
          >
            ✕
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Follow these steps to get your wecelebrate backend up and running
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isPast = index < currentStep || step.completed;
          
          return (
            <div 
              key={step.id}
              className={`
                flex items-start gap-4 p-4 rounded-lg transition-all
                ${isActive ? 'bg-[#D91C81]/10 border-2 border-[#D91C81]' : 'bg-gray-50'}
                ${isPast ? 'opacity-75' : ''}
              `}
            >
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                ${isActive ? 'ring-2 ring-[#D91C81] ring-offset-2' : ''}
              `}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`
                    text-lg font-semibold
                    ${step.completed ? 'text-green-700 line-through' : 'text-gray-900'}
                  `}>
                    {step.title}
                  </span>
                  {isActive && !step.completed && (
                    <span className="text-xs bg-[#D91C81] text-white px-2 py-1 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {step.description}
                </p>
                
                {/* Step-specific content */}
                {step.id === 'create-project' && !step.completed && isActive && (
                  <div className="space-y-2">
                    <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                      <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#D91C81] underline">supabase.com/dashboard</a></li>
                      <li>Click "New Project"</li>
                      <li>Name it "wecelebrate-development"</li>
                      <li>Choose a region and database password</li>
                      <li>Click "Create new project"</li>
                    </ol>
                    <Button 
                      size="sm" 
                      onClick={() => markStepComplete('create-project')}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      ✓ Done - Project Created
                    </Button>
                  </div>
                )}
                
                {step.id === 'deploy-function' && !step.completed && isActive && step.command && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Run this command in your terminal:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-900 text-green-400 px-3 py-2 rounded text-xs font-mono">
                        {step.command}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyCommand(step.command)}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      The script will ask for your project credentials and deploy automatically
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => markStepComplete('deploy-function')}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      ✓ Done - Function Deployed
                    </Button>
                  </div>
                )}
                
                {step.id === 'add-credentials' && !step.completed && isActive && (
                  <div className="space-y-2">
                    <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                      <li>Go to Supabase Dashboard → Settings → API</li>
                      <li>Copy your <strong>Project URL</strong> (e.g., https://abc123.supabase.co)</li>
                      <li>Copy your <strong>anon public</strong> key</li>
                      <li>Click "Edit" on the Development environment below</li>
                      <li>Paste the credentials and click "Save"</li>
                    </ol>
                    <Button 
                      size="sm" 
                      onClick={() => markStepComplete('add-credentials')}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      ✓ Done - Credentials Added
                    </Button>
                  </div>
                )}
                
                {step.id === 'test-connection' && !step.completed && isActive && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Click the <strong>"Test Connection"</strong> button on the Development environment card below.
                    </p>
                    <p className="text-xs text-gray-600">
                      If successful, you'll see: "Development environment is online! ✓"
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => markStepComplete('test-connection')}
                      className="bg-green-600 hover:bg-green-700 mt-2"
                    >
                      ✓ Done - Connection Tested
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {allComplete && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-semibold text-green-800 mb-1">
              Setup Complete!
            </p>
            <p className="text-sm text-green-700 mb-3">
              Your wecelebrate backend is configured and ready to use.
            </p>
            <Button 
              onClick={() => setShowWizard(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Get Started
            </Button>
          </div>
        )}
        
        {!allComplete && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Having trouble? Check the{' '}
              <a 
                href="/docs/FAILED_TO_FETCH_TROUBLESHOOTING.md" 
                target="_blank"
                className="underline font-semibold"
              >
                Troubleshooting Guide
              </a>
              {' '}for detailed help.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}