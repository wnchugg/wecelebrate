import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  Mail,
  Lock,
  User,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '../../utils/logger';
import { sanitizeString, checkRateLimit, logSecurityEvent } from '../../utils/frontendSecurity';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { BackendConnectionStatus } from '../../components/BackendConnectionStatus';
import { DeploymentEnvironmentSelector } from '../../components/DeploymentEnvironmentSelector';

// Email validation helper
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export function AdminSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'super_admin' | 'admin' | 'manager'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Get current environment for password manager integration
  const currentEnv = getCurrentEnvironment();

  // Password strength validation
  const validatePasswordStrength = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate username
    if (formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    // Validate password
    const passwordErrors = validatePasswordStrength(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = `Password must have: ${passwordErrors.join(', ')}`;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Client-side rate limiting
    const rateCheck = checkRateLimit('admin_signup', 3, 60 * 60 * 1000); // 3 per hour
    if (!rateCheck.allowed) {
      toast.error(
        `Too many signup attempts. Please try again in ${rateCheck.retryAfter} seconds.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedData = {
        email: sanitizeString(formData.email.trim().toLowerCase()),
        username: sanitizeString(formData.username.trim()),
        password: formData.password,
        role: formData.role
      };

      const env = getCurrentEnvironment();
      const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      const envProjectId = urlMatch ? urlMatch[1] : projectId;
      const apiUrl = `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;

      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Signup failed' }));
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();

      logSecurityEvent({
        type: 'auth_success',
        details: 'Admin signup successful',
        severity: 'low'
      });

      setSuccess(true);
      toast.success('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        void navigate('/admin/login');
      }, 2000);

    } catch (error: unknown) {
      logger.error('Signup error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">Redirecting to login page...</p>
            <div className="w-8 h-8 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Environment Indicators */}
        <div className="mb-4 space-y-2">
          <DeploymentEnvironmentSelector />
          <BackendConnectionStatus />
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D91C81] to-[#00B4CC] p-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Admin Account</h1>
            <p className="text-white/90">JALA 2 Gifting Platform</p>
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => void handleSubmit(e)} 
            className="space-y-5 px-8 py-6"
            name={`admin-signup-${currentEnv.id}`}
          >
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
              {errors.email && (
                <div className="mt-1">
                  <p className="text-sm text-red-600">{errors.email}</p>
                  {errors.email.includes('already registered') && (
                    <Link 
                      to="/admin/login" 
                      className="text-xs text-[#D91C81] hover:text-[#B71569] font-medium mt-1 inline-block"
                    >
                      Go to login page →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none bg-white"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose Super Admin for full system access
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
              {formData.password && !errors.password && (
                <div className="mt-2 space-y-1">
                  {validatePasswordStrength(formData.password).length === 0 ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Strong password
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Required: {validatePasswordStrength(formData.password).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring-4 focus:ring-pink-100 transition-all outline-none"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Form Error */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ boxShadow: '0 4px 12px rgba(217, 28, 129, 0.3)' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="px-8 pb-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/admin/login" 
                className="text-[#D91C81] hover:text-[#B71569] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white hover:text-white/90 transition-all text-sm font-medium"
          >
            ← Back to Main Site
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;