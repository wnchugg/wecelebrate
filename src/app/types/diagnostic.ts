/**
 * Diagnostic and Testing Types
 * Type definitions for diagnostic tools and test results
 */

export interface ConnectionTestResult {
  name: string;
  projectId: string;
  url: string;
  status: number | string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface ConnectionTestResults {
  timestamp: string;
  figmaMakeConfig: {
    projectId: string;
    publicAnonKey: string;
    url: string;
  };
  currentEnvironment: unknown;
  allEnvironments: unknown;
  connectionTests: ConnectionTestResult[];
}

export interface EndpointTestResult {
  status: number;
  ok: boolean;
  data: unknown;
  error?: string | null;
}

export interface DataDiagnosticResults {
  environment: {
    projectId: string;
    baseUrl: string;
    hasToken: boolean;
    token: string;
  };
  endpoints: Record<string, EndpointTestResult>;
}

export interface JWTTokenInfo {
  algorithm?: string;
  type?: string;
  userId?: string;
  email?: string;
  username?: string;
  role?: string;
  environment?: string;
  issuedAt?: string;
  expiresAt?: string;
  expired?: boolean;
  timeLeft?: number;
}

export interface JWTDiagnosticResult {
  timestamp?: string;
  environment?: string;
  tokenExists?: boolean;
  tokenInfo?: JWTTokenInfo;
  decodeError?: string;
  backendVerification?: unknown;
  backendVerificationError?: string;
  message?: string;
  action?: string;
  error?: string;
  healthCheck?: {
    ok: boolean;
    status: number | string;
    data?: unknown;
    error?: string;
  };
  protectedEndpoint?: {
    ok: boolean;
    status: number | string;
    data?: unknown;
    error?: string;
  };
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
