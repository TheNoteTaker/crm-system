import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Conversation = Database['public']['Tables']['conversations']['Row'];

export function useConversations() {
  const { tenant } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            customer_id,
            messages,
            last_message,
            last_message_at,
            customers (
              id,
              name,
              avatar_url,
              status
            )
          `)
          .eq('tenant_id', tenant.id)
          .order('last_message_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to changes
    const channel = supabase.channel(`tenant-${tenant.id}-conversations`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${tenant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations(prev => [payload.new as Conversation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setConversations(prev => 
              prev.map(conv => 
                conv.id === payload.new.id ? payload.new as Conversation : conv
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

  const sendMessage = async (conversationId: string, message: string) => {
    if (!tenant) return;

    const newMessage = {
      type: 'agent',
      text: message,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('conversations')
      .update({
        messages: supabase.sql`array_append(messages, ${newMessage}::jsonb)`,
        last_message: message,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('tenant_id', tenant.id);

    if (error) throw error;
  };

  return {
    conversations,
    loading,
    error,
    sendMessage
  };
}