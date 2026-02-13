/**
 * Supabase Client Configuration
 * Provides a singleton Supabase client instance for the application
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Create Supabase client instance
const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase: SupabaseClient = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Re-export for convenience
export default supabase;
