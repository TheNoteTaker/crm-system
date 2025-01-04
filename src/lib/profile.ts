import { supabase } from './supabase';
import { handleDatabaseError } from './errors';
import type { User } from './database.types';

/**
 * Handles user profile operations
 */
export async function getUserProfile(userId: string) {
  try {
    // Try RPC first
    const { data: rpcProfile, error: rpcError } = await supabase
      .rpc('get_user_profile', { user_id: userId });

    // If RPC succeeds, return the profile
    if (!rpcError && rpcProfile) {
      return { data: rpcProfile, error: null };
    }

    // Fallback to direct query if RPC fails
    const { data: profile, error: queryError } = await supabase
      .from('users')
      .select(`
        *,
        tenants (
          id,
          name,
          domain
        )
      `)
      .eq('id', userId)
      .single();

    if (queryError) throw queryError;

    // Transform the response
    const transformedProfile = profile ? {
      ...profile,
      tenant_name: profile.tenants?.name,
      tenant_domain: profile.tenants?.domain
    } : null;

    delete transformedProfile?.tenants;

    return { data: transformedProfile, error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error: handleDatabaseError(error) };
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleDatabaseError(error) };
  }
}