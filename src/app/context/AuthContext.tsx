import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logSecurityEvent, startSessionTimer, clearSessionTimer, resetSessionTimer } from '../utils/security';

export interface User {
  id: string;
  email: string;
  name?: string;
  employeeId?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userIdentifier: string | null;
  user: User | null;
  authenticate: (identifier: string, userData?: User) => void;
  login: (identifier: string, userData?: User) => void; // Alias for authenticate
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const logout = () => {
    logSecurityEvent({
      action: 'logout',
      status: 'success',
      details: { userIdentifier: userIdentifier || undefined }
    });
    
    setIsAuthenticated(false);
    setUserIdentifier(null);
    setUser(null);
    clearSessionTimer();
  };

  const authenticate = (identifier: string, userData?: User) => {
    logSecurityEvent({
      action: 'authentication',
      status: 'success',
      details: { userIdentifier: identifier }
    });
    
    setIsAuthenticated(true);
    setUserIdentifier(identifier);
    if (userData) {
      setUser(userData);
    } else {
      // Create basic user object from identifier
      setUser({
        id: identifier,
        email: identifier,
      });
    }
    
    // Start session timeout timer
    startSessionTimer(logout);
  };

  // Reset session timer on user activity
  useEffect(() => {
    if (!isAuthenticated) return () => {}; // Return empty cleanup

    const handleActivity = () => {
      resetSessionTimer(logout);
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSessionTimer();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userIdentifier,
        user,
        authenticate,
        login: authenticate, // Alias for authenticate
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}