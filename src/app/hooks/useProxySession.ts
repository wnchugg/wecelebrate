/**
 * Proxy Session Hook
 * Manages proxy login session state and lifecycle
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentProxySession, endProxySession } from '../services/proxyLoginApi';
import { ProxySession } from '../../types/advancedAuth';
import { toast } from 'sonner';

interface ProxySessionState {
  session: ProxySession | null;
  loading: boolean;
  error: Error | null;
}

export function useProxySession() {
  const [state, setState] = useState<ProxySessionState>({
    session: null,
    loading: true,
    error: null,
  });

  // Load current proxy session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getCurrentProxySession();
        setState({
          session,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load proxy session:', error);
        setState({
          session: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    void loadSession();
  }, []);

  // Check if session is expired
  useEffect(() => {
    if (!state.session) return undefined;

    const checkExpiry = () => {
      if (new Date(state.session.expiresAt) < new Date()) {
        toast.warning('Proxy session has expired');
        setState(prev => ({ ...prev, session: null }));
        localStorage.removeItem('proxy_session_token');
      }
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [state.session]);

  // End the current proxy session
  const endSession = useCallback(async () => {
    if (!state.session) return;

    try {
      await endProxySession(state.session.id);
      setState(prev => ({ ...prev, session: null }));
      localStorage.removeItem('proxy_session_token');
      toast.success('Proxy session ended');
      
      // Redirect to admin dashboard
      window.location.href = '/admin';
    } catch (error) {
      console.error('Failed to end proxy session:', error);
      toast.error('Failed to end session');
    }
  }, [state.session]);

  return {
    session: state.session,
    loading: state.loading,
    error: state.error,
    isProxySession: !!state.session,
    endSession,
  };
}
