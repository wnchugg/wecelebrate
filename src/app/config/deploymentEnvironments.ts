/**
 * Deployment Environment Configuration
 * 
 * This manages runtime switching between different Supabase backend projects
 * (Development vs Production databases).
 * 
 * NOTE: This is separate from buildConfig.ts which handles build-time environments.
 * - buildConfig.ts: Build environments (dev/staging/prod) - feature flags, timeouts, etc.
 * - deploymentEnvironments.ts: Runtime deployment targets (which Supabase project to use)
 */

import { publicAnonKey } from '../../../utils/supabase/info';

export type EnvironmentType = 'development' | 'test' | 'uat' | 'production';

export interface DeploymentEnvironment {
  id: string;
  name: string;
  label: string;
  color: string;
  badge: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  anonKey: string; // Alias for supabaseAnonKey
  apiBaseUrl: string; // Computed API base URL
  description: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'testing';
  lastTested?: string;
  createdAt?: string;
  updatedAt?: string;
}

// CORRECTED Project IDs - Using actual Supabase project configurations
// Development: wjfcqqrlhwdvvjmefxky (WITH TWO v's - where backend is deployed)
// Production: lmffeqwhrnbsbhdztwyv (end-user data only)

const DEV_PROJECT_ID = 'wjfcqqrlhwdvvjmefxky';
// CRITICAL FIX: Use the actual anon key from /utils/supabase/info.tsx as fallback
let DEV_ANON_KEY = publicAnonKey;
try {
  DEV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;
} catch {
  // import.meta.env not available, use publicAnonKey
}

const PROD_PROJECT_ID = 'lmffeqwhrnbsbhdztwyv';
let PROD_ANON_KEY = publicAnonKey;
try {
  PROD_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || publicAnonKey;
} catch {
  // import.meta.env not available, use publicAnonKey
}

// Fallback environment configurations (used until dynamic ones are loaded)
// NOTE: Currently configured for 2 environments (Dev + Prod)
// Test and UAT fall back to Development for cost savings
//
// IMPORTANT: Admin authentication MUST go through the Development environment
// because the backend Edge Function is deployed there. The Production environment
// is for end-user data only (clients, sites, gifts), not for admin authentication.
export const fallbackEnvironments: Record<string, DeploymentEnvironment> = {
  development: {
    id: 'development',
    name: 'Development',
    label: 'DEV',
    color: '#10B981', // Green
    badge: 'bg-green-100 text-green-800 border-green-300',
    supabaseUrl: `https://${DEV_PROJECT_ID}.supabase.co`,
    supabaseAnonKey: DEV_ANON_KEY,
    anonKey: DEV_ANON_KEY,
    apiBaseUrl: `https://${DEV_PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3`,
    description: 'Development environment - Admin auth & testing (Backend deployed here)',
    isDefault: true,
    status: 'active',
  },
  production: {
    id: 'production',
    name: 'Production',
    label: 'PROD',
    color: '#EF4444', // Red
    badge: 'bg-red-100 text-red-800 border-red-300',
    supabaseUrl: `https://${DEV_PROJECT_ID}.supabase.co`, // Uses Dev backend for auth
    supabaseAnonKey: DEV_ANON_KEY, // Uses Dev key for auth
    anonKey: DEV_ANON_KEY,
    apiBaseUrl: `https://${DEV_PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3`,
    description: 'Production data environment - Uses Dev backend for auth',
    isDefault: false,
    status: 'inactive',
  },
};

// Runtime cache for dynamic environments loaded from backend
let cachedEnvironments: Record<string, DeploymentEnvironment> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // Cache for 1 minute

// Load environments from backend
async function loadEnvironmentsFromBackend(): Promise<Record<string, DeploymentEnvironment>> {
  try {
    // Check cache first
    if (cachedEnvironments && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedEnvironments;
    }

    const response = await fetch(
      `https://${DEV_PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/config/environments`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEV_ANON_KEY}`, // Required for Supabase Edge Functions
        },
        credentials: 'omit',
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.environments && Array.isArray(data.environments)) {
        // Convert array to record
        const envRecord: Record<string, DeploymentEnvironment> = {};
        data.environments.forEach((env: DeploymentEnvironment) => {
          envRecord[env.id] = env;
        });
        
        // Update cache
        cachedEnvironments = envRecord;
        cacheTimestamp = Date.now();
        
        return envRecord;
      }
    }

    // If fetch fails or no data, return fallback
    return fallbackEnvironments;
  } catch (error) {
    // This is expected until backend is deployed - silently use fallback
    console.warn('ℹ️ Backend not deployed yet - using fallback environments. Deploy with: ./scripts/redeploy-backend.sh dev');
    return fallbackEnvironments;
  }
}

// Get current environment from localStorage or default to development
export function getCurrentEnvironment(): DeploymentEnvironment {
  // Safety check for SSR/build-time execution
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return fallbackEnvironments.development;
  }
  
  const stored = localStorage.getItem('deployment_environment') || 'development';
  
  // Use cached environments if available
  if (cachedEnvironments) {
    return cachedEnvironments[stored] || cachedEnvironments['development'] || fallbackEnvironments.development;
  }
  
  // Otherwise use fallback
  return fallbackEnvironments[stored] || fallbackEnvironments.development;
}

// Async version that ensures environments are loaded from backend
export async function getCurrentEnvironmentAsync(): Promise<DeploymentEnvironment> {
  const environments = await loadEnvironmentsFromBackend();
  const stored = typeof localStorage !== 'undefined' 
    ? (localStorage.getItem('deployment_environment') || 'development')
    : 'development';
  return environments[stored] || environments['development'] || fallbackEnvironments.development;
}

// Set the current environment
export function setCurrentEnvironment(envId: string): void {
  const currentEnv = getCurrentEnvironment();
  
  // Only clear token if actually switching to a different environment
  if (currentEnv.id !== envId) {
    localStorage.setItem('deployment_environment', envId);
    
    // Clear cache to force reload
    cachedEnvironments = null;
    
    // Clear access token when switching environments since JWT tokens are project-specific
    sessionStorage.removeItem('jala_access_token');
    
    // Reload the page to apply new environment configuration
    window.location.reload();
  }
}

// Get all available environments (synchronous - uses cache or fallback)
export function getAvailableEnvironments(): DeploymentEnvironment[] {
  if (cachedEnvironments) {
    return Object.values(cachedEnvironments);
  }
  return Object.values(fallbackEnvironments);
}

// Get all available environments (async - loads from backend)
export async function getAvailableEnvironmentsAsync(): Promise<DeploymentEnvironment[]> {
  const environments = await loadEnvironmentsFromBackend();
  return Object.values(environments);
}

// Initialize environments cache on module load
loadEnvironmentsFromBackend().catch(() => {
  // Silently fail and use fallback
});

// Export for backward compatibility
export const environments = fallbackEnvironments;

// Export array version for easy iteration
export const DEPLOYMENT_ENVIRONMENTS = Object.values(fallbackEnvironments);

/**
 * Safely extract the project ID from a Supabase URL
 * @param supabaseUrl - The full Supabase URL (e.g., "https://projectid.supabase.co")
 * @returns The project ID or 'unknown' if extraction fails
 */
export function extractProjectId(supabaseUrl: string): string {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || 'unknown';
}

/**
 * Build API URL for the JALA backend server
 * @param env - The deployment environment
 * @returns The full API URL for the make-server endpoint
 */
export function buildApiUrl(env: DeploymentEnvironment): string {
  const projectId = extractProjectId(env.supabaseUrl);
  return `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
}