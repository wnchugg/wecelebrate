import { useState, useEffect } from 'react';
import { X, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AdvancedAuthUser } from '../../../types/advancedAuth';
import { useNameFormat } from '../../hooks/useNameFormat';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { generateSecurePassword, validatePassword } from '../../utils/passwordValidation';

interface SetPasswordModalProps {
  open: boolean;
  user: AdvancedAuthUser | null;
  onClose: () => void;
  onSetPassword: (userId: string, password: string, forceReset: boolean) => Promise<void>;
}

export function SetPasswordModal({ open, user, onClose, onSetPassword }: SetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [forceReset, setForceReset] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const { formatFullName } = useNameFormat();

  useEffect(() => {
    if (open) {
      // Generate initial password when modal opens
      setPassword(generateSecurePassword(16));
      setForceReset(true);
      setShowPassword(false);
    }
  }, [open]);

  const handleGeneratePassword = () => {
    setPassword(generateSecurePassword(16));
    setShowPassword(true);
  };

  const handleSetPassword = async () => {
    if (!user || !password) return;

    setSaving(true);
    try {
      await onSetPassword(user.id, password, forceReset);
      onClose();
    } catch (error) {
      console.error('Failed to set password:', error);
    } finally {
      setSaving(false);
    }
  };

  const validation = validatePassword(password);
  const isPasswordValid = validation.valid;

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Set Temporary Password</h3>
            <p className="text-sm text-gray-600 mt-1">
              For {formatFullName(user.firstName, user.lastName)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="set-password-input" className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="set-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-3">
                <PasswordStrengthIndicator password={password} showErrors={true} />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleGeneratePassword}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Random Password
          </Button>

          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="forceReset"
              checked={forceReset}
              onChange={(e) => setForceReset(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
            />
            <label htmlFor="forceReset" className="text-sm text-gray-700 cursor-pointer">
              Force user to reset password on next login
            </label>
          </div>

          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              The temporary password will be sent to the user's email address ({user.email}).
              {forceReset && ' They will be required to change it on their first login.'}
            </AlertDescription>
          </Alert>

          {!forceReset && (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900">
                For security, it's recommended to force password reset on first login.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSetPassword()}
            disabled={saving || !isPasswordValid}
            className="flex-1 bg-[#D91C81] hover:bg-[#B01669] text-white"
          >
            {saving ? 'Setting Password...' : 'Set Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
