/**
 * Rate Limit Hook
 * React hook for rate limiting user actions
 * Phase 2.4: Security Hardening
 */

import { useState, useCallback, useEffect } from 'react';
import { rateLimiter, RATE_LIMITS, createRateLimitKey } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface UseRateLimitResult {
  isAllowed: boolean;
  isBlocked: boolean;
  remainingAttempts: number;
  timeUntilUnblocked: number;
  checkLimit: () => boolean;
  reset: () => void;
}

/**
 * Hook for rate limiting user actions
 */
export function useRateLimit(
  action: string,
  identifier?: string,
  config: RateLimitConfig = RATE_LIMITS.API_GENERAL,
  options?: {
    showToast?: boolean;
    toastMessage?: string;
  }
): UseRateLimitResult {
  const key = createRateLimitKey(action, identifier);
  const [isBlocked, setIsBlocked] = useState(rateLimiter.isBlocked(key));
  const [remainingAttempts, setRemainingAttempts] = useState(
    rateLimiter.getRemainingAttempts(key, config)
  );
  const [timeUntilUnblocked, setTimeUntilUnblocked] = useState(
    rateLimiter.getTimeUntilUnblocked(key)
  );

  // Update blocked status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlocked(rateLimiter.isBlocked(key));
      setTimeUntilUnblocked(rateLimiter.getTimeUntilUnblocked(key));
      setRemainingAttempts(rateLimiter.getRemainingAttempts(key, config));
    }, 1000);

    return () => clearInterval(interval);
  }, [key, config]);

  const checkLimit = useCallback(() => {
    const allowed = rateLimiter.checkLimit(key, config);
    
    // Update state
    setIsBlocked(rateLimiter.isBlocked(key));
    setRemainingAttempts(rateLimiter.getRemainingAttempts(key, config));
    setTimeUntilUnblocked(rateLimiter.getTimeUntilUnblocked(key));

    // Show toast if blocked
    if (!allowed && options?.showToast) {
      const message = options.toastMessage || 
        `Too many attempts. Please wait ${Math.ceil(timeUntilUnblocked / 1000)} seconds.`;
      toast.error(message);
      logger.warn(`[useRateLimit] Action blocked: ${action}`);
    }

    return allowed;
  }, [key, config, action, options, timeUntilUnblocked]);

  const reset = useCallback(() => {
    rateLimiter.reset(key);
    setIsBlocked(false);
    setRemainingAttempts(config.maxAttempts);
    setTimeUntilUnblocked(0);
    logger.log(`[useRateLimit] Reset: ${action}`);
  }, [key, config, action]);

  return {
    isAllowed: !isBlocked && remainingAttempts > 0,
    isBlocked,
    remainingAttempts,
    timeUntilUnblocked,
    checkLimit,
    reset
  };
}

/**
 * Hook specifically for login rate limiting
 */
export function useLoginRateLimit(email?: string) {
  return useRateLimit(
    'login',
    email,
    RATE_LIMITS.LOGIN,
    {
      showToast: true,
      toastMessage: 'Too many login attempts. Please try again later.'
    }
  );
}

/**
 * Hook for API call rate limiting
 */
export function useApiRateLimit(endpoint: string, type: 'general' | 'write' | 'heavy' = 'general') {
  const configMap = {
    general: RATE_LIMITS.API_GENERAL,
    write: RATE_LIMITS.API_WRITE,
    heavy: RATE_LIMITS.API_HEAVY
  };

  return useRateLimit(
    `api:${endpoint}`,
    undefined,
    configMap[type],
    {
      showToast: true,
      toastMessage: 'Too many requests. Please slow down.'
    }
  );
}

/**
 * Hook for form submission rate limiting
 */
export function useFormRateLimit(formName: string) {
  return useRateLimit(
    `form:${formName}`,
    undefined,
    RATE_LIMITS.FORM_SUBMISSION,
    {
      showToast: true,
      toastMessage: 'Please wait before submitting again.'
    }
  );
}