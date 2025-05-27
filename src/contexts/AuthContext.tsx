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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in, checking profile status");
          
          // Check if user already has profile data (existing user vs new user)
          const { data: existingUserData } = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          console.log("Existing user data:", existingUserData);
          
          if (!existingUserData) {
            // Completely new user - create initial record and mark as new user
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
          } else if (existingUserData && (!existingUserData.profile_data || Object.keys(existingUserData.profile_data).length === 0)) {
            // Existing user without completed onboarding
            console.log("Existing user without completed onboarding");
            setIsNewUser(true);
          } else {
            // Existing user with completed onboarding
            console.log("Existing user with completed onboarding");
            setIsNewUser(false);
          }
        }
        
        // Handle transferring onboarding data after sign in/up
        if (event === 'SIGNED_IN' && session?.user) {
          const onboardingData = localStorage.getItem('onboarding_profile_data');
          if (onboardingData) {
            try {
              const parsedData = JSON.parse(onboardingData);
              console.log("Found onboarding data, transferring to user_data table");
              
              // Save to user_data table
              const { error } = await supabase
                .from('user_data')
                .upsert({
                  user_id: session.user.id,
                  profile_data: parsedData,
                  updated_at: new Date().toISOString()
                });

              if (error) {
                console.error("Error transferring onboarding data:", error);
              } else {
                console.log("Successfully transferred onboarding data");
                localStorage.removeItem('onboarding_profile_data');
                setIsNewUser(false); // User has completed onboarding
                toast({
                  title: "Profile Saved",
                  description: "Your onboarding data has been saved to your account!",
                });
              }
            } catch (e) {
              console.error("Could not parse onboarding data:", e);
              localStorage.removeItem('onboarding_profile_data');
            }
          }
        }
        
        // Fetch profile if user is logged in
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsNewUser(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if this is a new user based on profile completion
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          if (profileData && (!profileData.profile_data || Object.keys(profileData.profile_data).length === 0)) {
            setIsNewUser(true);
          } else {
            setIsNewUser(false);
          }
        });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Try to get profile from user_data table
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

      // If no user_data found, profile will be null
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
