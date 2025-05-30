
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
  const initializationComplete = useRef(false);
  const profileLoadingRef = useRef(false);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

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

  // Periodic session validation
  useEffect(() => {
    const validateSession = async () => {
      if (!session) return;
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('AuthContext: Session validation failed, clearing auth state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error('AuthContext: Session validation error:', error);
      }
    };

    // Validate session every 5 minutes
    if (session) {
      sessionCheckRef.current = setInterval(validateSession, 5 * 60 * 1000);
    }

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [session]);

  useEffect(() => {
    console.log('AuthContext: Initializing auth state...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session);
        
        // Handle session updates synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Mark initialization as complete after first event
        if (!initializationComplete.current) {
          initializationComplete.current = true;
          setIsLoading(false);
        }
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out, clearing local data');
          // Clear any cached data on sign out
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
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Token refreshed successfully');
        }
        
        if (event === 'SIGNED_IN') {
          console.log('AuthContext: User signed in successfully');
        }
        
        // Load user profile when user signs in (deferred to prevent deadlock)
        if (session?.user && !profileLoadingRef.current) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
          setIsNewUser(false);
          profileLoadingRef.current = false;
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
          // Try to refresh session if get session fails
          await refreshSession();
        } else {
          console.log('AuthContext: Initial session loaded:', !!initialSession);
          
          // Only update state if we haven't received auth events yet
          if (!initializationComplete.current) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            // Load user profile if session exists
            if (initialSession?.user) {
              setTimeout(() => {
                loadUserProfile(initialSession.user.id);
              }, 0);
            }
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        // Attempt session recovery
        await refreshSession();
      } finally {
        // Ensure loading is set to false even if initialization fails
        if (!initializationComplete.current) {
          initializationComplete.current = true;
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Handle page visibility changes to refresh session when returning to tab
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        refreshSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, []); // Empty dependency array to run only once

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

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsNewUser(false);
      profileLoadingRef.current = false;
      
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
