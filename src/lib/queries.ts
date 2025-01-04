import { supabase } from './supabase';
import { handleDatabaseError } from './errors';
import type { Database } from './database.types';
import type { User as AuthUser } from '@supabase/supabase-js';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];

export async function createUserProfile(authUser: AuthUser, name: string = 'New User') {
  try {
    // Use the default tenant ID
    const tenantId = '00000000-0000-0000-0000-000000000001';

    if (!tenantId) throw new Error('No default tenant found');

    // Create user profile
    const { data: profile, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        tenant_id: tenantId,
        email: authUser.email,
        name,
        role: 'admin'
      })
      .select()
      .single();

    if (error) throw error;
    return { data: profile, error: null };
  } catch (error) {
    return { data: null, error: handleDatabaseError(error) };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .rpc('get_user_profile', { user_id: userId });

    if (error) throw error;
    return { data: profile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: handleDatabaseError(error) };
  }
}
interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

interface FilterParams {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export async function createCustomer(data: CustomerInsert) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { data: customer, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: handleDatabaseError(error)
    };
  }
}

export async function listCustomers(
  tenantId: string,
  { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'desc' }: PaginationParams,
  filters?: FilterParams
) {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range((page - 1) * limit, page * limit);

    // Apply filters if provided
    if (filters?.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters?.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { 
      data, 
      error: null,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };
  } catch (error) {
    return {
      data: null,
      error: handleDatabaseError(error),
      pagination: null
    };
  }
}