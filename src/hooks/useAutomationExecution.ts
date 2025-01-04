import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TriggerConfig, ActionConfig } from '../lib/types/automation';

export function useAutomationExecution() {
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant) return;

    // Subscribe to relevant tables for automation triggers
    const channels = [
      subscribeToCustomers(),
      subscribeToOrders()
    ];

    return () => {
      channels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [tenant]);

  const subscribeToCustomers = () => {
    return supabase.channel('customers-automation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customers',
          filter: `tenant_id=eq.${tenant?.id}`
        },
        async (payload) => {
          await handleNewCustomer(payload.new);
        }
      )
      .subscribe();
  };

  const subscribeToOrders = () => {
    return supabase.channel('orders-automation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenant?.id}`
        },
        async (payload) => {
          await handleNewOrder(payload.new);
        }
      )
      .subscribe();
  };

  const handleNewCustomer = async (customer: any) => {
    // Fetch relevant automation rules
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('tenant_id', tenant?.id)
      .eq('trigger_type', 'new_customer')
      .eq('is_active', true);

    if (!rules) return;

    // Execute each matching rule
    for (const rule of rules) {
      await executeAction(rule.action_type, rule.action_config, { customer });
    }
  };

  const handleNewOrder = async (order: any) => {
    // Similar implementation for order-related automations
  };

  const executeAction = async (
    actionType: keyof ActionConfig,
    config: ActionConfig[keyof ActionConfig],
    context: Record<string, any>
  ) => {
    if (!tenant) return;

    const logAutomationEvent = async (success: boolean, error?: string) => {
      await supabase.from('automation_logs').insert([{
        tenant_id: tenant.id,
        action_type: actionType,
        context,
        success,
        error,
        created_at: new Date().toISOString()
      }]);
    };

    switch (actionType) {
      case 'send_email':
        try {
          const { template, subject } = config as ActionConfig['send_email'];
          // Add email sending logic here
          await logAutomationEvent(true);
        } catch (error) {
          await logAutomationEvent(false, error.message);
          throw error;
        }
        break;

      case 'create_task':
        try {
          const { title, assignee } = config as ActionConfig['create_task'];
          const { data, error } = await supabase
            .from('tasks')
            .insert([{
              tenant_id: tenant.id,
              title,
              assignee,
              status: 'pending',
              created_at: new Date().toISOString()
            }]);
          
          if (error) throw error;
          await logAutomationEvent(true);
        } catch (error) {
          await logAutomationEvent(false, error.message);
          throw error;
        }
        break;

      case 'webhook':
        try {
          const { url, method, headers } = config as ActionConfig['webhook'];
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            body: JSON.stringify(context)
          });
          
          if (!response.ok) {
            throw new Error(`Webhook failed: ${response.statusText}`);
          }
          
          await logAutomationEvent(true);
        } catch (error) {
          await logAutomationEvent(false, error.message);
          throw error;
        }
        break;
    }
  };
}