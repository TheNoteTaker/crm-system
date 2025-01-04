import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import { createUserProfile, getUserProfile } from '../lib/queries';
import type { User as UserProfile } from '../lib/queries';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: 'Auth not initialized' }),
  signUp: async () => ({ error: 'Auth not initialized' }),
  signOut: async () => { throw new Error('Auth not initialized'); }
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: 'Supabase configuration is missing. Please check your environment variables.'
      });
      return;
    }

    if (!supabase) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: 'Failed to initialize Supabase client'
      });
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let profile = null;
        
        if (session?.user) {
          const { data: userProfile } = await getUserProfile(session.user.id);
          profile = userProfile;
        }

        setState({
          user: session?.user || null,
          profile,
          loading: false,
          error: null
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            let newProfile = null;
            
            if (newSession?.user) {
              const { data: userProfile } = await getUserProfile(newSession.user.id);
              newProfile = userProfile;
            }

            setState({
              user: newSession?.user || null,
              profile: newProfile,
              loading: false,
              error: null
            });
          }
        );

        return () => {
          subscription.unsubscribe();
        }
      } catch (error) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: handleSupabaseError(error).message
        });
      }
    };

    initAuth();
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data: profile, error } = await getUserProfile(userId);

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error: handleSupabaseError(error).message };
      }
      
      if (!data.session?.user) {
        return { error: 'No user data returned' };
      }
      
      const profile = await fetchUserProfile(data.session.user.id);
      setState(s => ({ 
        ...s, 
        user: data.session.user,
        profile
      }));
      
      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error).message };
    }
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(handleSupabaseError(error).message);
    }

    setState({
      user: null,
      profile: null,
      loading: false,
      error: null
    });
  }

  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: email.split('@')[0] },
          emailRedirectTo: `${window.location.origin}`
        }
      });
      
      if (error) {
        return { error: handleSupabaseError(error).message };
      }
      
      // If sign up successful, sign in automatically
      if (data.user) {
        // Create user profile
        const { error: profileError } = await createUserProfile(
          data.user, 
          data.user.user_metadata?.name || email.split('@')[0]
        );

        if (profileError) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(data.user.id);
          return { error: profileError.message };
        }

        const signInResult = await signIn(email, password);
        if (signInResult.error) return signInResult;
      }
      
      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error).message };
    }
  }

  const value = {
    ...state,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}