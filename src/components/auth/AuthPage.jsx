import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '../../lib/validations';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!isSignUp) {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          if (error.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error);
          }
          return;
        }
      } else {
        const { error: signUpError } = await signUp(data.email, data.password);
        if (signUpError) {
          if (signUpError.includes('already registered')) {
            toast.error('This email is already registered');
          } else {
            toast.error(signUpError);
          }
          return;
        }
        toast.success('Account created! Please sign in.');
        setIsSignUp(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Bolt CRM</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-hover text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:text-primary-light text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}