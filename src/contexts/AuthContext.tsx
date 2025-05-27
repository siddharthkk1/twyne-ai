import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isNewUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  clearNewUserFlag: () => void;
  updateUserData: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, "Session:", !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in, processing profile");
          
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // Check for existing user data
              const { data: existingUserData } = await supabase
                .from('user_data')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              console.log("Existing user data:", existingUserData);
              
              // Handle onboarding data transfer
              const onboardingData = localStorage.getItem('onboarding_profile_data');
              if (onboardingData && !existingUserData) {
                try {
                  const parsedData = JSON.parse(onboardingData);
                  console.log("Found onboarding data, creating user_data record");
                  
                  const ssoData = session.user.app_metadata?.provider === 'google' ? {
                    provider: 'google',
                    provider_id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                    avatar_url: session.user.user_metadata?.avatar_url,
                    iss: 'https://accounts.google.com',
                    raw_user_metadata: session.user.user_metadata
                  } : null;
                  
                  const { error } = await supabase
                    .from('user_data')
                    .insert({
                      user_id: session.user.id,
                      sso_data: ssoData,
                      profile_data: parsedData,
                      conversation_data: {},
                      prompt_mode: 'structured',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });

                  if (error) {
                    console.error("Error saving onboarding data:", error);
                  } else {
                    console.log("Successfully saved onboarding data");
                    localStorage.removeItem('onboarding_profile_data');
                    setIsNewUser(false);
                    
                    // Fetch the newly created profile
                    await fetchProfile(session.user.id);
                    
                    toast({
                      title: "Profile Saved",
                      description: "Your onboarding data has been saved to your account!",
                    });
                  }
                } catch (e) {
                  console.error("Error parsing onboarding data:", e);
                  localStorage.removeItem('onboarding_profile_data');
                }
              } else if (!existingUserData) {
                // Completely new user without onboarding data
                console.log("New user detected, creating initial user_data record");
                
                const ssoData = session.user.app_metadata?.provider === 'google' ? {
                  provider: 'google',
                  provider_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                  avatar_url: session.user.user_metadata?.avatar_url,
                  iss: 'https://accounts.google.com',
                  raw_user_metadata: session.user.user_metadata
                } : null;
                
                await supabase
                  .from('user_data')
                  .insert({
                    user_id: session.user.id,
                    sso_data: ssoData,
                    profile_data: {},
                    conversation_data: {},
                    prompt_mode: 'structured',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                setIsNewUser(true);
              } else {
                // Existing user
                console.log("Existing user, checking onboarding status");
                const hasCompletedOnboarding = existingUserData.profile_data && 
                  Object.keys(existingUserData.profile_data).length > 0;
                
                setIsNewUser(!hasCompletedOnboarding);
                await fetchProfile(session.user.id);
              }
            } catch (error) {
              console.error("Error processing user sign in:", error);
            }
          }, 100);
        } else if (!session) {
          // User signed out
          setProfile(null);
          setIsNewUser(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Initial session check:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          if (!mounted) return;
          
          if (profileData && (!profileData.profile_data || Object.keys(profileData.profile_data).length === 0)) {
            setIsNewUser(true);
          } else {
            setIsNewUser(false);
          }
        });
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userDataError && userData) {
        setProfile({
          ...userData,
          profile_data: userData.profile_data,
          sso_data: userData.sso_data
        });
        return userData;
      }

      if (userDataError || !userData) {
        console.log('No user_data found, profile will be null');
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.fullName,
            avatar_url: userData.avatarUrl,
            has_onboarded: userData.has_onboarded || false,
            profile_data: userData.profile_data || {},
          },
        },
      });

      if (!error) {
        setIsNewUser(true);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsNewUser(false);
  };

  const updateUserData = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: data
      });

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile data has been updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Update error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const clearNewUserFlag = () => {
    console.log("Clearing new user flag");
    setIsNewUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isNewUser,
        signIn,
        signUp,
        signOut,
        clearNewUserFlag,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
