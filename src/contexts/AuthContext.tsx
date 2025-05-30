
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          console.log('AuthContext: Initial session loaded:', !!initialSession);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session);
        
        // Handle session updates synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false if we're not already done with initial load
        if (event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out, clearing local data');
          // Clear any cached data on sign out
          localStorage.removeItem('spotify_profile');
          localStorage.removeItem('spotify_data');
          localStorage.removeItem('spotify_raw_data');
          localStorage.removeItem('youtube_channel');
          localStorage.removeItem('youtube_data');
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully');
        }
      }
    );

    // Get initial session after setting up the listener
    getInitialSession();

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user...');
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      
      console.log('AuthContext: Sign out successful');
      
      // Clear local storage
      localStorage.removeItem('spotify_profile');
      localStorage.removeItem('spotify_data');
      localStorage.removeItem('spotify_raw_data');
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('youtube_channel');
      localStorage.removeItem('youtube_data');
      localStorage.removeItem('google_access_token');
      
    } catch (error) {
      console.error('AuthContext: Error in signOut:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
