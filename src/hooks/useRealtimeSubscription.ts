import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SubscriptionConfig {
  table: string;
  tenantId: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  tenantId,
  onInsert,
  onUpdate,
  onDelete
}: SubscriptionConfig) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !tenantId) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create a channel for tenant-specific updates
      channel = supabase.channel(`tenant-${tenantId}-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onInsert?.(payload.new);
                break;
              case 'UPDATE':
                onUpdate?.(payload.new);
                break;
              case 'DELETE':
                onDelete?.(payload.old);
                break;
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, tenantId, user]);
}