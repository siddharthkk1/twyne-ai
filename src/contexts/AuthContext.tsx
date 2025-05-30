
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface UserProfile {
  username?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  profile_data?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isNewUser: boolean;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  clearNewUserFlag: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isInitialLoad = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session);
        
        // Handle session updates synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after initial session check
        if (!isInitialLoad) {
          setIsLoading(false);
        }
        
        // Load user profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsNewUser(false);
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
          setProfile(null);
          setIsNewUser(false);
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully');
        }
      }
    );

    // Get initial session after setting up the listener
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
          
          // Load user profile if session exists
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
      } finally {
        isInitialLoad = false;
        setIsLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        console.log('User profile loaded:', data);
        // Safely handle the profile_data which is of type Json
        const profileData = data.profile_data;
        if (profileData && typeof profileData === 'object' && !Array.isArray(profileData)) {
          setProfile(profileData as UserProfile);
          setIsNewUser(!profileData || Object.keys(profileData).length === 0);
        } else {
          setProfile(null);
          setIsNewUser(true);
        }
      } else {
        console.log('No user profile found - new user');
        setProfile(null);
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setProfile(null);
      setIsNewUser(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const clearNewUserFlag = () => {
    setIsNewUser(false);
  };

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
    isNewUser,
    profile,
    signOut,
    signIn,
    signUp,
    clearNewUserFlag,
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
