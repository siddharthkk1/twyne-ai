
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Use refs to prevent race conditions
  const profileLoadingRef = useRef(false);

  // Session recovery function
  const refreshSession = async () => {
    try {
      console.log('AuthContext: Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('AuthContext: Session refresh failed:', error);
        // Clear invalid session
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }
      
      console.log('AuthContext: Session refreshed successfully');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing session:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  const loadUserProfile = async (userId: string) => {
    if (profileLoadingRef.current) {
      console.log('AuthContext: Profile already loading, skipping...');
      return;
    }
    
    profileLoadingRef.current = true;
    
    try {
      console.log('AuthContext: Loading user profile for:', userId);
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
    } finally {
      profileLoadingRef.current = false;
    }
  };

  useEffect(() => {
    console.log('AuthContext: Starting initialization...');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('AuthContext: Auth state changed:', event, !!session);
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              console.log('AuthContext: User signed out, clearing local data');
              localStorage.removeItem('spotify_profile');
              localStorage.removeItem('spotify_data');
              localStorage.removeItem('spotify_raw_data');
              localStorage.removeItem('spotify_access_token');
              localStorage.removeItem('spotify_refresh_token');
              localStorage.removeItem('youtube_channel');
              localStorage.removeItem('youtube_data');
              localStorage.removeItem('google_access_token');
              localStorage.removeItem('google_refresh_token');
              setProfile(null);
              setIsNewUser(false);
              profileLoadingRef.current = false;
            }
            
            if (session?.user && !profileLoadingRef.current) {
              setTimeout(() => {
                if (mounted) {
                  loadUserProfile(session.user.id);
                }
              }, 0);
            } else if (!session?.user) {
              setProfile(null);
              setIsNewUser(false);
              profileLoadingRef.current = false;
            }
            
            // Set loading to false after processing auth change
            if (mounted) {
              setIsLoading(false);
            }
          }
        );

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
        } else {
          console.log('AuthContext: Initial session loaded:', !!initialSession);
          
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            setTimeout(() => {
              if (mounted) {
                loadUserProfile(initialSession.user.id);
              }
            }, 0);
          }
        }
        
        // Set loading to false after initial session check
        if (mounted) {
          setIsLoading(false);
        }

        return () => {
          console.log('AuthContext: Cleaning up auth subscription');
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('AuthContext: Error in initialization:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthContext: Sign in error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('AuthContext: Sign in exception:', error);
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
      
      if (error) {
        console.error('AuthContext: Sign up error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('AuthContext: Sign up exception:', error);
      return { error };
    }
  };

  const clearNewUserFlag = () => {
    setIsNewUser(false);
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      
      console.log('AuthContext: Sign out successful');
      
      // Clear local storage immediately
      localStorage.removeItem('spotify_profile');
      localStorage.removeItem('spotify_data');
      localStorage.removeItem('spotify_raw_data');
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('youtube_channel');
      localStorage.removeItem('youtube_data');
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
      
      // State will be cleared by the auth state change listener
      
    } catch (error) {
      console.error('AuthContext: Error in signOut:', error);
      throw error;
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
    refreshSession,
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
