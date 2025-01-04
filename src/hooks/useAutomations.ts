import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type AutomationRule = Database['public']['Tables']['automation_rules']['Row'];

export function useAutomations() {
  const { tenant } = useAuth();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const fetchRules = async () => {
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRules(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch automation rules'));
      } finally {
        setLoading(false);
      }
    };

    fetchRules();

    // Subscribe to changes
    const channel = supabase.channel(`tenant-${tenant.id}-automation_rules`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_rules',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRules(prev => [payload.new as AutomationRule, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRules(prev => 
              prev.map(rule => 
                rule.id === payload.new.id ? payload.new as AutomationRule : rule
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRules(prev => prev.filter(rule => rule.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant]);

  const addRule = async (data: Omit<AutomationRule, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!tenant) return;

    const { error } = await supabase
      .from('automation_rules')
      .insert([
        {
          ...data,
          tenant_id: tenant.id
        }
      ]);

    if (error) throw error;
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    if (!tenant) return;

    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: isActive })
      .eq('id', ruleId)
      .eq('tenant_id', tenant.id);

    if (error) throw error;
  };

  return {
    rules,
    loading,
    error,
    addRule,
    toggleRule
  };
}