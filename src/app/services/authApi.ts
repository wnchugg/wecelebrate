import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { logBypassLoginAttempt, logBypassSessionEnd } from './auditLogService';

/**
 * Bypass Login Request
 */
export interface BypassLoginRequest {
  siteId: string;
  email: string;
  password: string;
  twoFactorCode?: string;
}

/**
 * Bypass Login Response
 */
export interface BypassLoginResponse {
  success: boolean;
  requires2FA?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Admin Bypass Login
 * 
 * Authenticates a site manager using username/password when SSO is enabled.
 * This endpoint:
 * - Validates credentials
 * - Checks if user has site manager role
 * - Enforces 2FA if required
 * - Validates IP whitelist (backend)
 * - Creates audit log entry
 * 
 * @param request - Bypass login request
 * @returns Bypass login response
 */
export async function bypassLogin(request: BypassLoginRequest): Promise<BypassLoginResponse> {
  try {
    logger.info('[authApi] Attempting bypass login', { 
      siteId: request.siteId,
      email: request.email.substring(0, 3) + '***'
    });

    // Call the backend bypass login endpoint
    // In a real implementation, this would be a Supabase Edge Function or API endpoint
    const { data, error } = await supabase.functions.invoke('admin-bypass-login', {
      body: {
        siteId: request.siteId,
        email: request.email,
        password: request.password,
        twoFactorCode: request.twoFactorCode,
      },
    });

    if (error) {
      logger.error('[authApi] Bypass login error:', error);
      
      // Log failed attempt
      await logBypassLoginAttempt(
        request.siteId,
        request.email,
        false,
        false,
        error.message || 'API error'
      );
      
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.requires2FA) {
      logger.info('[authApi] 2FA required for bypass login');
      
      // Log 2FA requirement
      await logBypassLoginAttempt(
        request.siteId,
        request.email,
        false,
        true
      );
      
      return {
        success: false,
        requires2FA: true,
        message: 'Two-factor authentication required',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data?.success) {
      logger.info('[authApi] Bypass login successful');
      
      // Log successful login
      await logBypassLoginAttempt(
        request.siteId,
        request.email,
        true
      );
      
      // Store the session token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data.token) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        localStorage.setItem('bypass_session_token', data.token as string);
      }
      
      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        token: data.token,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        user: data.user,
      };
    }

    // Log failed attempt
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const failureMessage = (data?.message as string) || 'Invalid credentials';
    await logBypassLoginAttempt(
      request.siteId,
      request.email,
      false,
      false,
      failureMessage
    );

    return {
      success: false,
      message: failureMessage,
    };
  } catch (err) {
    logger.error('[authApi] Bypass login exception:', err);
    
    // Log exception
    await logBypassLoginAttempt(
      request.siteId,
      request.email,
      false,
      false,
      'Exception during login'
    );
    
    return {
      success: false,
      message: 'An error occurred during login. Please try again.',
    };
  }
}

/**
 * Verify Bypass Session
 * 
 * Verifies that the current bypass session is valid
 * 
 * @param siteId - Site ID
 * @returns True if session is valid
 */
export async function verifyBypassSession(siteId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('bypass_session_token');
    if (!token) {
      return false;
    }

    const { data, error } = await supabase.functions.invoke('verify-bypass-session', {
      body: {
        siteId,
        token,
      },
    });

    if (error) {
      logger.error('[authApi] Session verification error:', error);
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return data?.valid === true;
  } catch (err) {
    logger.error('[authApi] Session verification exception:', err);
    return false;
  }
}

/**
 * End Bypass Session
 * 
 * Ends the current bypass session and clears the token
 * 
 * @param siteId - Site ID
 * @param userId - User ID (optional, for audit logging)
 */
export async function endBypassSession(siteId: string, userId?: string): Promise<void> {
  try {
    const token = localStorage.getItem('bypass_session_token');
    if (!token) {
      return;
    }

    await supabase.functions.invoke('end-bypass-session', {
      body: {
        siteId,
        token,
      },
    });

    localStorage.removeItem('bypass_session_token');
    logger.info('[authApi] Bypass session ended');
    
    // Log session end
    if (userId) {
      await logBypassSessionEnd(siteId, userId);
    }
  } catch (err) {
    logger.error('[authApi] Error ending bypass session:', err);
    // Still remove the token even if the API call fails
    localStorage.removeItem('bypass_session_token');
  }
}
