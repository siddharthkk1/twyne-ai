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
        console.log("Auth state changed:", event, "Session:", session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("User signed in, checking if new user...");
          
          // Keep loading true while we check for new user status
          setIsLoading(true);
          
          try {
            // Check if user has any profile data
            const { data: userData, error } = await supabase
              .from('user_data')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            console.log("User data check result:", { userData, error });
            
            if (!userData && !error) {
              console.log("New user detected - no user_data record exists");
              setIsNewUser(true);
              
              // Create initial user_data record for new users
              const { error: insertError } = await supabase
                .from('user_data')
                .insert({
                  user_id: session.user.id,
                  profile_data: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error("Error creating initial user_data:", insertError);
              } else {
                console.log("Created initial user_data record");
              }
            } else if (userData) {
              // Check if profile_data is empty - if so, still consider them new
              const hasProfileData = userData.profile_data && 
                typeof userData.profile_data === 'object' && 
                Object.keys(userData.profile_data).length > 0;
              
              console.log("Existing user found, hasProfileData:", hasProfileData);
              setIsNewUser(!hasProfileData);
            }
            
            // Handle transferring onboarding data after sign in/up
            const onboardingData = localStorage.getItem('onboarding_profile_data');
            if (onboardingData) {
              try {
                const parsedData = JSON.parse(onboardingData);
                console.log("Found onboarding data, transferring to user_data table");
                
                // Save to user_data table
                const { error: updateError } = await supabase
                  .from('user_data')
                  .upsert({
                    user_id: session.user.id,
                    profile_data: parsedData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (updateError) {
                  console.error("Error transferring onboarding data:", updateError);
                } else {
                  console.log("Successfully transferred onboarding data");
                  localStorage.removeItem('onboarding_profile_data');
                  setIsNewUser(false); // Clear new user flag since they now have data
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
            
            // Fetch profile if user is logged in
            await fetchProfile(session.user.id);
            
          } catch (error) {
            console.error("Error in auth state handler:", error);
          } finally {
            console.log("Setting isLoading to false, isNewUser:", isNewUser);
            setIsLoading(false);
          }
        } else if (!session) {
          // User signed out
          setProfile(null);
          setIsNewUser(false);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      if (!session) {
        setIsLoading(false);
      }
      // Don't set session/user here - let onAuthStateChange handle it
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Try to get profile from user_data table
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userDataError && userData) {
        console.log("Found user data:", userData);
        setProfile({
          ...userData,
          profile_data: userData.profile_data
        });
        return;
      }

      // If no user_data found, set profile to null
      if (userDataError || !userData) {
        console.log('No user_data found');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
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

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
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
