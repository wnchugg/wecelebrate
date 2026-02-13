// Runtime environment configuration for the frontend
// This allows admins to switch between different backend environments

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export type EnvironmentType = 'development' | 'test' | 'uat' | 'production';

export interface EnvironmentConfig {
  id: string;
  name: string;
  label: string;
  color: string;
  badge: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  description: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'testing';
  lastTested?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// PROJECT REFERENCES - CORRECT VALUES
// ============================================
// Development: wjfcqqrlhwdvvjmefxky (WITH TWO v's)
// Production: lmffeqwhrnbsbhdztwyv
//
// ⚠️ IMPORTANT: Get anon keys from Supabase dashboard:
// Dev: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
// Prod: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv/settings/api
// ============================================

const DEV_PROJECT_ID = 'wjfcqqrlhwdvvjmefxky';
// CRITICAL FIX: Use the actual anon key from /utils/supabase/info.tsx as fallback
const DEV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

const PROD_PROJECT_ID = 'lmffeqwhrnbsbhdztwyv';
// CRITICAL FIX: Use the actual anon key from /utils/supabase/info.tsx as fallback
const PROD_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || publicAnonKey;

// Fallback environment configurations (used until dynamic ones are loaded)
// NOTE: Currently configured for 2 environments (Dev + Prod)
// Test and UAT fall back to Development for cost savings
//
// IMPORTANT: Admin authentication MUST go through the Development environment
// because the backend Edge Function is deployed there. The Production environment
// is for end-user data only (clients, sites, gifts), not for admin authentication.
export const fallbackEnvironments: Record<string, EnvironmentConfig> = {
  development: {
    id: 'development',
    name: 'Development',
    label: 'DEV',
    color: '#10B981', // Green
    badge: 'bg-green-100 text-green-800 border-green-300',
    supabaseUrl: `https://${DEV_PROJECT_ID}.supabase.co`,
    supabaseAnonKey: DEV_ANON_KEY,
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
    description: 'Production data environment - Uses Dev backend for auth',
    isDefault: false,
    status: 'inactive',
  },
};

// Runtime cache for dynamic environments loaded from backend
let cachedEnvironments: Record<string, EnvironmentConfig> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // Cache for 1 minute

// Load environments from backend
async function loadEnvironmentsFromBackend(): Promise<Record<string, EnvironmentConfig>> {
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
          // No Authorization header - endpoint is public
        },
        credentials: 'omit',
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.environments && Array.isArray(data.environments)) {
        // Convert array to record
        const envRecord: Record<string, EnvironmentConfig> = {};
        data.environments.forEach((env: EnvironmentConfig) => {
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
    console.info('ℹ️ Backend not deployed yet - using fallback environments. Deploy with: ./scripts/redeploy-backend.sh dev');
    return fallbackEnvironments;
  }
}

// Get current environment from localStorage or default to development
export function getCurrentEnvironment(): EnvironmentConfig {
  const stored = localStorage.getItem('deployment_environment') || 'development';
  
  // Use cached environments if available
  if (cachedEnvironments) {
    return cachedEnvironments[stored] || cachedEnvironments['development'] || fallbackEnvironments.development;
  }
  
  // Otherwise use fallback
  return fallbackEnvironments[stored] || fallbackEnvironments.development;
}

// Async version that ensures environments are loaded from backend
export async function getCurrentEnvironmentAsync(): Promise<EnvironmentConfig> {
  const environments = await loadEnvironmentsFromBackend();
  const stored = localStorage.getItem('deployment_environment') || 'development';
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
export function getAvailableEnvironments(): EnvironmentConfig[] {
  if (cachedEnvironments) {
    return Object.values(cachedEnvironments);
  }
  return Object.values(fallbackEnvironments);
}

// Get all available environments (async - loads from backend)
export async function getAvailableEnvironmentsAsync(): Promise<EnvironmentConfig[]> {
  const environments = await loadEnvironmentsFromBackend();
  return Object.values(environments);
}

// Initialize environments cache on module load
loadEnvironmentsFromBackend().catch(() => {
  // Silently fail and use fallback
});

// Export for backward compatibility
export const environments = fallbackEnvironments;