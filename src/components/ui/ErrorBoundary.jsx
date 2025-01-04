import React from 'react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isConfigError = this.state.error?.message?.includes('Supabase');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {isConfigError ? 'Configuration Required' : 'Something went wrong'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {isConfigError ? (
                  <div className="text-left">
                    <p className="mb-4">Please add your Supabase configuration to continue:</p>
                    <ol className="list-decimal ml-4 space-y-2">
                      <li>Create a Supabase project</li>
                      <li>Copy your project URL and anon key</li>
                      <li>Add them to your .env file as:
                        <code className="block mt-2 p-2 bg-gray-100 dark:bg-dark-hover rounded text-sm overflow-x-auto">
                          VITE_SUPABASE_URL=your-project-url{'\n'}
                          VITE_SUPABASE_ANON_KEY=your-anon-key
                        </code>
                      </li>
                    </ol>
                  </div>
                ) : (
                  this.state.error?.message || 'An unexpected error occurred'
                )}
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}