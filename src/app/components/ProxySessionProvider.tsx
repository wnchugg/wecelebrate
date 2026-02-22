/**
 * Proxy Session Provider
 * Wraps the application to provide proxy session context and enforce read-only mode
 */

import { createContext, useContext, ReactNode } from 'react';
import { useProxySession } from '../hooks/useProxySession';
import { ProxyLoginBanner } from './ProxyLoginBanner';
import { ProxySession } from '../../types/advancedAuth';

interface ProxySessionContextValue {
  session: ProxySession | null;
  isProxySession: boolean;
  isReadOnly: boolean;
  endSession: () => Promise<void>;
}

const ProxySessionContext = createContext<ProxySessionContextValue | undefined>(undefined);

export function useProxySessionContext() {
  const context = useContext(ProxySessionContext);
  if (!context) {
    throw new Error('useProxySessionContext must be used within ProxySessionProvider');
  }
  return context;
}

interface ProxySessionProviderProps {
  children: ReactNode;
}

export function ProxySessionProvider({ children }: ProxySessionProviderProps) {
  const { session, isProxySession, endSession, loading } = useProxySession();

  // Don't render until we've checked for a proxy session
  if (loading) {
    return null;
  }

  const contextValue: ProxySessionContextValue = {
    session,
    isProxySession,
    isReadOnly: isProxySession, // Proxy sessions are always read-only
    endSession,
  };

  return (
    <ProxySessionContext.Provider value={contextValue}>
      {isProxySession && session && (
        <ProxyLoginBanner
          employeeName=""
          employeeFirstName=""
          employeeLastName=""
          expiresAt={new Date(session.expiresAt)}
          onEndSession={endSession}
        />
      )}
      <div className={isProxySession ? 'pt-16' : ''}>
        {children}
      </div>
    </ProxySessionContext.Provider>
  );
}

/**
 * Hook to check if current session is read-only
 * Use this to disable purchase buttons, edit actions, etc.
 */
export function useReadOnlyMode() {
  const { isReadOnly } = useProxySessionContext();
  return isReadOnly;
}
