import { useState, useRef, useEffect } from 'react';
import { Server, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import { 
  getAvailableEnvironments, 
  getCurrentEnvironment,
  setCurrentEnvironment,
  type EnvironmentType 
} from '../config/deploymentEnvironments';
export interface DeploymentEnvironmentSelectorProps {
  variant?: 'login' | 'header';
  className?: string;
}

export function DeploymentEnvironmentSelector({ 
  variant = 'login',
  className = '' 
}: DeploymentEnvironmentSelectorProps) {
  const currentEnv = getCurrentEnvironment();
  const availableEnvironments = getAvailableEnvironments();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {}; // Return empty cleanup for early exit
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return () => {}; // Return empty cleanup for early exit
  }, [isOpen]);

  useEffect(() => {
    // Environment credentials check - uses current env
    if (currentEnv) {
      setHasCredentials(true);
    }
    return () => {}; // Return empty cleanup for async effect
  }, [currentEnv]);

  useEffect(() => {
    if (!hasCredentials) {
      setShowWarning(true);
      return () => {}; // Return empty cleanup function
    }

    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 10000);

    return () => clearTimeout(timer); // Proper cleanup for timeout
  }, [hasCredentials]);

  const handleEnvironmentChange = (envId: EnvironmentType) => {
    if (envId !== currentEnv.id) {
      // Check if user is logged in
      const hasToken = sessionStorage.getItem('jala_access_token');
      
      // Show confirmation for production
      if (envId === 'production') {
        const message = hasToken 
          ? '⚠️ You are switching to PRODUCTION environment.\n\nThis will connect to live data and you will need to log in again. Are you sure?'
          : '⚠️ You are switching to PRODUCTION environment.\n\nThis will connect to live data. Are you sure?';
        const confirmed = window.confirm(message);
        if (!confirmed) {
          setIsOpen(false);
          return;
        }
      } else if (hasToken) {
        // Show login warning for any environment switch when logged in
        const confirmed = window.confirm(
          `You are switching to ${envId.toUpperCase()} environment.\n\nYou will need to log in again with credentials for the ${envId} environment. Continue?`
        );
        if (!confirmed) {
          setIsOpen(false);
          return;
        }
      }
      
      setCurrentEnvironment(envId);
      // Page will reload automatically via setCurrentEnvironment
    } else {
      setIsOpen(false);
    }
  };

  if (variant === 'login') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gradient-to-r from-[#1B2A5E] to-[#2A3A7E] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-between gap-2 border border-white/20"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>Environment:</span>
            <span 
              className="px-2 py-0.5 rounded-md text-xs font-bold border"
              style={{ backgroundColor: currentEnv.color + '20', color: currentEnv.color, borderColor: currentEnv.color }}
            >
              {currentEnv.label}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 px-2">Select Deployment Environment</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {availableEnvironments.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => handleEnvironmentChange(env.id as EnvironmentType)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 ${
                    env.id === currentEnv.id ? 'bg-pink-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-bold border"
                        style={{ backgroundColor: env.color + '20', color: env.color, borderColor: env.color }}
                      >
                        {env.label}
                      </span>
                      <span className="font-semibold text-gray-900">{env.name}</span>
                      {env.id === 'production' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{env.description}</p>
                  </div>
                  
                  {env.id === currentEnv.id && (
                    <Check className="w-5 h-5 text-[#D91C81] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-yellow-50 border-t border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Changing the environment will reload the page and connect to a different backend.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header variant (compact)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-bold shadow-sm hover:shadow-md"
        style={{ 
          backgroundColor: currentEnv.color + '20', 
          color: currentEnv.color,
          borderColor: currentEnv.color
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Server className="w-4 h-4" />
        <span>{currentEnv.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-600 px-2">Deployment Environment</p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {availableEnvironments.map((env) => (
              <button
                key={env.id}
                type="button"
                onClick={() => handleEnvironmentChange(env.id as EnvironmentType)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-bold border"
                      style={{ backgroundColor: env.color + '20', color: env.color, borderColor: env.color }}
                    >
                      {env.label}
                    </span>
                    <span className="font-semibold text-gray-900">{env.name}</span>
                    {env.id === 'production' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{env.description}</p>
                </div>
                
                {env.id === currentEnv.id && (
                  <Check className="w-5 h-5 text-[#D91C81] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}