import { useState } from 'react';
import { useNavigate } from 'react-router';
import { sanitizeInput } from '../../utils/security';
import { showSuccessToast } from '../../utils/errorHandling';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export function BootstrapAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email || !username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedUsername = sanitizeInput(username.trim());
    const sanitizedPassword = password; // Don't sanitize password

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/bootstrap/create-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Environment-ID': 'development',
          },
          body: JSON.stringify({
            email: sanitizedEmail,
            username: sanitizedUsername,
            password: sanitizedPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      showSuccessToast('Admin user created successfully!');
      
      // Redirect to login after 1 second
      setTimeout(() => {
        void navigate('/admin/login');
      }, 1000);
    } catch (error: unknown) {
      console.error('Bootstrap error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create admin user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#2A3F7E] to-[#D91C81] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[#D91C81] bg-opacity-10 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-[#D91C81]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1B2A5E] mb-2">
            Create First Admin Account
          </h1>
          <p className="text-gray-600">
            Bootstrap your wecelebrate platform by creating the first admin user
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="bootstrap-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="bootstrap-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              placeholder="admin@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="bootstrap-username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="bootstrap-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              placeholder="admin"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="bootstrap-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="bootstrap-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="bootstrap-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="bootstrap-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D91C81] text-white py-3 rounded-lg font-medium hover:bg-[#B71569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => void navigate('/admin/login')}
            className="text-[#D91C81] hover:text-[#B71569] text-sm font-medium"
          >
            ← Back to Login
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs">
            <strong>Note:</strong> This creates the first super admin account with full
            access to the platform. You'll be able to create additional users after logging in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BootstrapAdmin;