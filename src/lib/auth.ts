import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import { handleDatabaseError } from './errors';

/**
 * Handles user authentication and profile management
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleDatabaseError(error) };
  }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleDatabaseError(error) };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getCurrentUser(): Promise<{ user: User | null, error: any }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: handleDatabaseError(error) };
  }
}