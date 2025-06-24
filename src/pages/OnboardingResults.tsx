
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import { UserProfile } from "@/types/chat";

const OnboardingResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);
  
  // Get profile data from navigation state or localStorage
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    console.log("🔄 OnboardingResults: Starting data resolution");
    console.log("📊 OnboardingResults: Location state:", location.state);
    
    // ENHANCED: Try to get profile data from navigation state first with better fallback handling
    if (location.state?.userProfile) {
      console.log("✅ OnboardingResults: Got profile from navigation state:", location.state.userProfile);
      setUserProfile(location.state.userProfile);
      
      // ENHANCED: Prioritize userName from navigation state, then profile name
      const navigationUserName = location.state.userName || location.state.userProfile.name;
      if (navigationUserName) {
        console.log("✅ OnboardingResults: Got userName from navigation state:", navigationUserName);
        setUserName(navigationUserName);
      }
    } else {
      // ENHANCED: Improved fallback with multiple localStorage keys and better error handling
      console.log("⚠️ OnboardingResults: No navigation state, trying localStorage fallback");
      
      try {
        // Try multiple localStorage keys for profile data
        const savedProfile = localStorage.getItem('onboardingProfile') || 
                            localStorage.getItem('onboarding_profile');
        
        // Try multiple localStorage keys for userName
        const savedUserName = localStorage.getItem('onboardingUserName') || 
                             localStorage.getItem('onboarding_user_name');
        
        console.log("📊 OnboardingResults: localStorage data found:", {
          hasProfile: !!savedProfile,
          hasUserName: !!savedUserName,
          savedUserName
        });
        
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          console.log("✅ OnboardingResults: Got profile from localStorage:", parsedProfile);
          setUserProfile(parsedProfile);
          
          // ENHANCED: Use savedUserName first, then profile name as fallback
          const finalUserName = savedUserName || parsedProfile.name || "";
          console.log("✅ OnboardingResults: Resolved userName:", finalUserName);
          setUserName(finalUserName);
        } else {
          console.warn("❌ OnboardingResults: No profile data found in localStorage or navigation state");
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("❌ OnboardingResults: Error parsing saved profile:", error);
        navigate("/onboarding");
      }
    }
  }, [location.state, navigate]);

  const handleCreateAccount = () => {
    setShowCreateAccountPrompt(true);
  };

  const handleGoToMirror = () => {
    navigate("/mirror");
  };

  // Show loading if no profile data yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading your profile...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your results.</p>
        </div>
      </div>
    );
  }

  // ENHANCED: Debug logging for final render
  console.log("🎯 OnboardingResults: Final render with:", {
    userName,
    profileName: userProfile?.name,
    displayName: userName || userProfile?.name
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        {/* Header with personalized greeting */}
        <div 
          className="text-center p-8 rounded-xl mb-4"
          style={{ 
            background: `linear-gradient(135deg, hsl(${(userName || userProfile?.name || "User").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 95%), hsl(${(userName || userProfile?.name || "User").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 60%, 85%))`,
            borderBottom: `3px solid hsl(${(userName || userProfile?.name || "User").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 35%)`
          }}
        >
          <h1 className="text-3xl font-bold mb-3" style={{ color: `hsl(${(userName || userProfile?.name || "User").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 35%)` }}>
            Welcome, {(userName || userProfile?.name || "User").split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Here's what we learned about you from our conversation. This information is private and only visible to you.
          </p>
        </div>

        {/* Top Create Account Card - Prominently displayed */}
        {!user && (
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Save Your Profile</h3>
                <p className="text-muted-foreground">
                  Create an account to save your insights and start using all of Twyne's features.
                </p>
                <Button 
                  onClick={handleCreateAccount}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                  size="lg"
                >
                  Create Account to Save Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ENHANCED: Pass userName with better fallback handling */}
        <ProfileCompletionDashboard 
          userProfile={userProfile} 
          userName={userName || userProfile?.name} 
        />

        {/* Create Account Card - Also at bottom for users who scroll down */}
        {!user && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Save Your Profile</h3>
                <p className="text-muted-foreground">
                  Create an account to save your insights and start using all of Twyne's features.
                </p>
                <Button 
                  onClick={handleCreateAccount}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  Create Account to Save Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleGoToMirror}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Go to Your Mirror
            </Button>
          </div>
        )}
      </div>

      {/* Create Account Prompt */}
      <CreateAccountPrompt 
        open={showCreateAccountPrompt}
        onOpenChange={setShowCreateAccountPrompt}
        onboardingProfileData={userProfile}
        onboardingConversationData={null}
        userName={userName || userProfile?.name}
      />
    </div>
  );
};

export default OnboardingResults;
