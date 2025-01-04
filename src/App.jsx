import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { AuthPage } from './components/auth/AuthPage';
import toast from 'react-hot-toast';
import { Header } from './components/ui/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { CustomersPage } from './components/customers/CustomersPage';
import { ConversationsPage } from './components/conversations/ConversationsPage';
import { CampaignsPage } from './components/campaigns/CampaignsPage';
import { ReportingPage } from './components/reporting/ReportingPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { MobileMenu } from './components/ui/MobileMenu';

/**
 * Main application component that handles routing and layout.
 * Manages the sidebar state and current page navigation.
 */
export default function App() {
  const { loading: authLoading, user, error: authError } = useAuth();
  // State for mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Current active page/route
  const [currentPage, setCurrentPage] = useState('dashboard');
  if (!supabase || authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {!supabase ? 'Configuration Required' : 'Authentication Error'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {!supabase ? 'Supabase configuration is missing.' : authError?.message || 'An unexpected error occurred'}
              {!supabase && (
              <ol className="list-decimal text-left pl-6 mt-4 space-y-2">
                <li>Create a Supabase project</li>
                <li>Copy your project URL and anon key</li>
                <li>Add them to your .env file</li>
              </ol>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handles navigation between pages and closes mobile sidebar
   * @param {string} page - The page identifier to navigate to
   */
  const handleMenuItemClick = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  /**
   * Renders the appropriate page component based on current route
   * @returns {React.ReactNode} The page component to render
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomersPage />;
      case 'conversations':
        return <ConversationsPage />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'reporting':
        return <ReportingPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  useEffect(() => {
    // Remove Supabase check since AuthContext handles this
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg dark:text-gray-100 transition-colors duration-200">
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onNavigate={setCurrentPage}
      />
      <div className="max-w-[1440px] mx-auto">
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            currentPage={currentPage}
            onMenuItemClick={handleMenuItemClick}
          />
          {renderPage()}
        </div>
      </div>
      <MobileMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleMenuItemClick}
      />
      <Toaster position="top-right" />
    </div>
  );
}