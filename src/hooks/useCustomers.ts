import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];

export function useCustomers() {
  const { tenant } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();

    // Subscribe to changes
    const channel = supabase.channel(`tenant-${tenant.id}-customers`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [payload.new as Customer, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => 
              prev.map(customer => 
                customer.id === payload.new.id ? payload.new as Customer : customer
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant]);

  const addCustomer = async (data: Omit<Customer, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!tenant) return;

    const { error } = await supabase
      .from('customers')
      .insert([
        {
          ...data,
          tenant_id: tenant.id
        }
      ]);

    if (error) throw error;
  };

  return {
    customers,
    loading,
    error,
    addCustomer
  };
}