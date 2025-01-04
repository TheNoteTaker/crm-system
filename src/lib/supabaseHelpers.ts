import { supabase } from './supabase';

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if Supabase is configured, false otherwise
 */
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key);
};

/**
 * Test the Supabase connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('tenants').select('count');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}