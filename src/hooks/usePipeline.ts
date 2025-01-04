import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Deal = Database['public']['Tables']['deals']['Row'];

export function usePipeline() {
  const { tenant } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const fetchDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            customers (
              id,
              name,
              email
            )
          `)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeals(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch deals'));
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();

    // Subscribe to changes
    const channel = supabase.channel(`tenant-${tenant.id}-deals`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDeals(prev => [payload.new as Deal, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDeals(prev => 
              prev.map(deal => 
                deal.id === payload.new.id ? payload.new as Deal : deal
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

  const updateDealStage = async (dealId: string, stage: string) => {
    if (!tenant) return;

    const { error } = await supabase
      .from('deals')
      .update({ stage })
      .eq('id', dealId)
      .eq('tenant_id', tenant.id);

    if (error) throw error;
  };

  return {
    deals,
    loading,
    error,
    updateDealStage
  };
}