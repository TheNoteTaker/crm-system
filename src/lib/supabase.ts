import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : null;

export type SupabaseError = {
  message: string;
  code?: string;
  details?: string;
};

export function handleSupabaseError(error: unknown): SupabaseError {
  if (!error) {
    return { message: 'An unknown error occurred' };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }
  
  if (typeof error === 'object' && error !== null) {
    const { message, code, details } = error as Record<string, any>;
    return {
      message: message || 'An error occurred',
      code,
      details
    };
  }
  
  return { message: String(error) };
}