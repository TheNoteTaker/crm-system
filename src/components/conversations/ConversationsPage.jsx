import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ConversationsList } from './ConversationsList';
import { ChatView } from './ChatView';
import toast from 'react-hot-toast';

export function ConversationsPage() {
  const { tenant } = useAuth();
  const { conversations, loading, error, sendMessage } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = async (text) => {
    try {
      await sendMessage(selectedConversation.id, text);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <main className="flex-1 min-w-0 overflow-hidden">
      <div className="h-[calc(100vh-4rem)] max-w-[1440px] mx-auto">
        <div className="h-full flex animate-fade-in">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ConversationsList
                conversations={filteredConversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
              />
            </div>
          </div>

          {/* Chat View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatView
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}