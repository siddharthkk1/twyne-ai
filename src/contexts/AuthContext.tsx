
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
  sso_data?: any;
  has_completed_onboarding?: boolean;
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
      
      // First check if we have a current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('AuthContext: Error getting current session:', sessionError);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (!currentSession) {
        console.log('AuthContext: No current session to refresh');
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Only try to refresh if we have a valid session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('AuthContext: Session refresh failed:', error);
        // Clear invalid session
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      console.log('AuthContext: Session refreshed successfully');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing session:', error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
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
      
      // First, let's check if there's a user_data row at all
      const { data, error, count } = await supabase
        .from('user_data')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      console.log('AuthContext: User data query result:', { data, error, count });

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        console.log('AuthContext: No user_data found - this is a brand new user');
        setProfile(null);
        setIsNewUser(true);
        console.log('AuthContext: Setting isNewUser to true (no user_data)');
        return;
      }

      if (!data || data.length === 0) {
        console.log('AuthContext: No user_data row found - user_data was not created by trigger');
        console.log('AuthContext: This indicates the database trigger may not be working');
        setProfile(null);
        setIsNewUser(true);
        console.log('AuthContext: Setting isNewUser to true (empty user_data)');
        return;
      }

      const userData = data[0];
      console.log('AuthContext: Found user_data:', userData);
      console.log('AuthContext: profile_data:', userData.profile_data);
      console.log('AuthContext: sso_data:', userData.sso_data);
      console.log('AuthContext: has_completed_onboarding:', userData.has_completed_onboarding);
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = userData.has_completed_onboarding || false;
      
      let userProfile: UserProfile = { has_completed_onboarding: hasCompletedOnboarding };
      let newUserFlag = false;
      
      // Check if there's meaningful SSO data (Google OAuth users)
      if (userData.sso_data && typeof userData.sso_data === 'object' && !Array.isArray(userData.sso_data) && Object.keys(userData.sso_data).length > 0) {
        console.log('AuthContext: Google SSO user detected with sso_data:', userData.sso_data);
        userProfile = { ...userProfile, ...userData.sso_data as UserProfile, sso_data: userData.sso_data };
        
        // For Google SSO users, they should always go through onboarding if they haven't completed it
        // Google SSO provides basic info but we still need to collect additional profile data
        if (!hasCompletedOnboarding) {
          console.log('AuthContext: Google SSO user has not completed onboarding - setting as new user');
          newUserFlag = true;
        } else {
          console.log('AuthContext: Google SSO user has completed onboarding - treating as existing user');
          newUserFlag = false;
        }
      } else if (userData.profile_data && typeof userData.profile_data === 'object' && !Array.isArray(userData.profile_data) && Object.keys(userData.profile_data).length > 0) {
        // Regular user with profile data
        console.log('AuthContext: Regular user with profile_data:', userData.profile_data);
        userProfile = { ...userProfile, ...userData.profile_data as UserProfile, profile_data: userData.profile_data };
        newUserFlag = !hasCompletedOnboarding;
      } else {
        // User with no meaningful data - definitely new
        console.log('AuthContext: User with no profile or SSO data - new user');
        newUserFlag = true;
      }
      
      setProfile(userProfile);
      setIsNewUser(newUserFlag);
      console.log('AuthContext: Final user profile set:', userProfile);
      console.log('AuthContext: Setting isNewUser to:', newUserFlag);
    } catch (error) {
      console.error('AuthContext: Error in loadUserProfile:', error);
      setProfile(null);
      setIsNewUser(true);
      console.log('AuthContext: Setting isNewUser to true (error case)');
    } finally {
      profileLoadingRef.current = false;
      // Only set loading to false after profile loading is complete
      setIsLoading(false);
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
            if (session?.user) {
              console.log('AuthContext: Session user metadata:', session.user.user_metadata);
              console.log('AuthContext: Session app metadata:', session.user.app_metadata);
              console.log('AuthContext: Session user email:', session.user.email);
              console.log('AuthContext: Session user created_at:', session.user.created_at);
            }
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_OUT') {
              console.log('AuthContext: User signed out, clearing local data');
              // ... keep existing code (localStorage clearing)
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
              setIsLoading(false);
            }
            
            if (session?.user && !profileLoadingRef.current) {
              // Keep loading true while we load the profile
              setIsLoading(true);
              setTimeout(() => {
                if (mounted) {
                  loadUserProfile(session.user.id);
                }
              }, 0);
            } else if (!session?.user) {
              setProfile(null);
              setIsNewUser(false);
              profileLoadingRef.current = false;
              setIsLoading(false);
            }
          }
        );

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          setIsLoading(false);
        } else {
          console.log('AuthContext: Initial session loaded:', !!initialSession);
          if (initialSession?.user) {
            console.log('AuthContext: Initial session user metadata:', initialSession.user.user_metadata);
            console.log('AuthContext: Initial session user app metadata:', initialSession.user.app_metadata);
            console.log('AuthContext: Initial session user email:', initialSession.user.email);
            console.log('AuthContext: Initial session user created_at:', initialSession.user.created_at);
          }
          
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            // Keep loading true while we load the profile
            setIsLoading(true);
            setTimeout(() => {
              if (mounted) {
                loadUserProfile(initialSession.user.id);
              }
            }, 0);
          } else {
            // No session, set loading to false
            setIsLoading(false);
          }
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
