import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { logger } from '../../utils/logger';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, AlertCircle, LogIn, UserPlus, Mail, Key } from 'lucide-react';
 
export function AdminHelper() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  
  // Diagnostic tool
  const [diagnosticIdentifier, setDiagnosticIdentifier] = useState('');
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const checkAdminExists = async () => {
    setIsChecking(true);
    try {
      const env = getCurrentEnvironment();
      const projectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/auth/check-admin-exists`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.supabaseAnonKey}`, // CRITICAL: Required for all Supabase Edge Function requests
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdminExists(data.exists);
        if (data.exists) {
          toast.info('Admin users exist. Use login below.');
        } else {
          toast.success('No admin users found. You can create one!');
        }
      } else {
        toast.error('Could not check admin status');
      }
    } catch (error) {
      logger.error('Check admin error:', error);
      toast.error('Failed to check admin status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const env = getCurrentEnvironment();
      const projectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.supabaseAnonKey}`, // CRITICAL: Required for all Supabase Edge Function requests
            'X-Environment-ID': env.id,
          },
          body: JSON.stringify({
            identifier: loginEmail, // Changed from 'email' to 'identifier'
            password: loginPassword,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('jala_access_token', data.access_token);
        sessionStorage.setItem('jala_user_email', data.user.email);
        sessionStorage.setItem('jala_user_name', data.user.user_metadata?.name || data.user.email);
        
        toast.success(`Welcome back, ${data.user.user_metadata?.name || 'Admin'}!`);
        
        setTimeout(() => {
          void navigate('/admin/dashboard');
        }, 500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
      }
    } catch (error: unknown) {
      logger.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSigningUp(true);
    try {
      const env = getCurrentEnvironment();
      const envProjectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

      const response = await fetch(
        `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('jala_access_token', data.token);
        toast.success('Account created successfully!');
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch (error: unknown) {
      logger.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleDiagnostic = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);

    try {
      const env = getCurrentEnvironment();
      const envProjectId = env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];

      const response = await fetch(
        `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin/diagnostic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDiagnosticResult(data);
        if (data.hasAdmins) {
          toast.success('Admin accounts found! You can now log in.');
        } else {
          toast.warning('No admin accounts found. Please create one first.');
        }
      } else {
        toast.error(data.error || 'Diagnostic failed');
      }
    } catch (error: unknown) {
      logger.error('Diagnostic error:', error);
      toast.error('Diagnostic failed. Please try again.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#2A3B6E] to-[#1B2A5E] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Access Helper
          </h1>
          <p className="text-blue-200">
            Check admin status and get access to your dashboard
          </p>
        </div>

        {/* Status Check Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Check Admin Status</h2>
              <p className="text-gray-600">See if admin users exist in the database</p>
            </div>
          </div>

          <button
            onClick={() => void checkAdminExists()}
            disabled={isChecking}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Check Status
              </>
            )}
          </button>

          {adminExists !== null && (
            <div className={`mt-4 p-4 rounded-xl border-2 ${
              adminExists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {adminExists ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">
                      Admin users exist. Use the login form below.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">
                      No admin users found. Use the signup form below.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Tool */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Diagnostic Tool</h2>
              <p className="text-gray-600">Run diagnostics to troubleshoot issues</p>
            </div>
          </div>

          <form onSubmit={() => void handleDiagnostic()} className="space-y-4">
            <div>
              <label htmlFor="helper-diagnostic-identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Diagnostic Identifier
              </label>
              <input
                id="helper-diagnostic-identifier"
                type="text"
                value={diagnosticIdentifier}
                onChange={(e) => setDiagnosticIdentifier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter diagnostic identifier"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isDiagnosing}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDiagnosing ? 'Diagnosing...' : 'Run Diagnostic'}
            </button>
          </form>

          {diagnosticResult && (
            <div className="mt-4 p-4 rounded-xl border-2 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Diagnostic Result: {JSON.stringify(diagnosticResult)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Login and Signup Forms Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#D91C81] bg-opacity-10 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6 text-[#D91C81]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                <p className="text-gray-600">Access your admin account</p>
              </div>
            </div>

            <form onSubmit={() => void handleLogin()} className="space-y-4">
              <div>
                <label htmlFor="helper-login-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="helper-login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="helper-login-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="helper-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white font-semibold rounded-xl hover:from-[#B71569] hover:to-[#9B1257] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#00B4CC] bg-opacity-10 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-[#00B4CC]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
                <p className="text-gray-600">Create a new admin account</p>
              </div>
            </div>

            <form onSubmit={() => void handleSignup()} className="space-y-4">
              <div>
                <label htmlFor="helper-signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="helper-signup-name"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="helper-signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="helper-signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="helper-signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="helper-signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="helper-signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="helper-signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00B4CC] focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#00B4CC] to-[#0095A8] text-white font-semibold rounded-xl hover:from-[#0095A8] hover:to-[#007A8C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningUp ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <div className="inline-flex gap-4 bg-white rounded-xl px-6 py-3 shadow-lg">
            <button
              onClick={() => void navigate('/admin/login')}
              className="text-[#D91C81] font-medium hover:underline"
            >
              Go to Login Page
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => void navigate('/admin/signup')}
              className="text-[#00B4CC] font-medium hover:underline"
            >
              Go to Signup Page
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => void navigate('/admin/deployment-checklist')}
              className="text-[#1B2A5E] font-medium hover:underline"
            >
              Deployment Checklist
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-900 bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border border-blue-300">
          <div className="flex items-start gap-3 text-white">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>• Click "Check Status" first to see if admin users exist</li>
                <li>• If admins exist, use the <strong>Login</strong> form with your credentials</li>
                <li>• If no admins exist, use the <strong>Sign Up</strong> form to create one</li>
                <li>• After login, you'll be redirected to the admin dashboard</li>
                <li>• Then go to <strong>/admin/deployment-checklist</strong> to start deploying!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}