
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Clipboard, ArrowLeft, Loader } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import type { Json } from '@/integrations/supabase/types';

interface UserProfile {
  name: string;
  location: string;
  interests: string[] | string;
  socialStyle: string;
  connectionPreferences: string;
  personalInsights: string[];
  vibeSummary?: string;
  socialNeeds?: string;
  coreValues?: string;
  lifeContext?: string;
  twyneTags?: string[];
  vibeWords?: string[];
  goals?: string;
}

const OnboardingPaste = () => {
  const [reflection, setReflection] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, clearNewUserFlag } = useAuth();

  // Example prompt that users can copy
  const examplePrompt = 
    "Based on everything you know about me from our conversations, who am I? What do you think I'm like? " +
    "Please describe my personality, interests, values, communication style, and any other insights " +
    "you've gathered. Be specific but concise.";

  const copyPrompt = () => {
    navigator.clipboard.writeText(examplePrompt);
    toast({
      title: "Copied to clipboard",
      description: "Paste this prompt into ChatGPT to get your reflection.",
    });
  };

  // Enhanced localStorage storage with multiple backup strategies and detailed logging
  const storeOnboardingDataSecurely = async (profileData: UserProfile, conversationData: any, promptMode: string) => {
    try {
      console.log('🚀 OnboardingPaste: Starting enhanced data storage...');
      console.log('📊 OnboardingPaste: Input data:', {
        profileName: profileData.name,
        profileKeys: Object.keys(profileData),
        conversationKeys: Object.keys(conversationData),
        promptMode: promptMode
      });
      
      const timestamp = Date.now();
      const dataToStore = {
        profile: profileData,
        conversation: conversationData,
        userName: profileData.name || "",
        promptMode: promptMode,
        timestamp: timestamp
      };
      
      console.log('📊 OnboardingPaste: Consolidated data to store:', {
        hasProfile: !!dataToStore.profile,
        hasConversation: !!dataToStore.conversation,
        userName: dataToStore.userName,
        promptMode: dataToStore.promptMode,
        timestamp: dataToStore.timestamp
      });
      
      // Strategy 1: Standard localStorage storage
      localStorage.setItem('onboardingProfile', JSON.stringify(profileData));
      localStorage.setItem('onboardingUserName', profileData.name || "");
      localStorage.setItem('onboardingConversation', JSON.stringify(conversationData));
      localStorage.setItem('onboardingPromptMode', promptMode);
      localStorage.setItem('onboardingTimestamp', timestamp.toString());
      console.log('💾 OnboardingPaste: Strategy 1 - Standard localStorage completed');
      
      // Strategy 2: Backup in sessionStorage
      sessionStorage.setItem('onboardingProfile', JSON.stringify(profileData));
      sessionStorage.setItem('onboardingUserName', profileData.name || "");
      sessionStorage.setItem('onboardingConversation', JSON.stringify(conversationData));
      sessionStorage.setItem('onboardingPromptMode', promptMode);
      console.log('💾 OnboardingPaste: Strategy 2 - SessionStorage backup completed');
      
      // Strategy 3: Combined backup object with unique key
      const backupKey = `onboardingBackup_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(backupKey, JSON.stringify(dataToStore));
      localStorage.setItem('latestBackupKey', backupKey);
      sessionStorage.setItem('onboardingBackup', JSON.stringify(dataToStore));
      console.log('💾 OnboardingPaste: Strategy 3 - Combined backup completed with key:', backupKey);
      
      // Strategy 4: OAuth-ready prefixed storage
      localStorage.setItem('oauth_onboardingProfile', JSON.stringify(profileData));
      localStorage.setItem('oauth_onboardingUserName', profileData.name || "");
      localStorage.setItem('oauth_onboardingConversation', JSON.stringify(conversationData));
      localStorage.setItem('oauth_onboardingPromptMode', promptMode);
      console.log('💾 OnboardingPaste: Strategy 4 - OAuth-prefixed storage completed');
      
      // Strategy 5: Store in temp database for additional safety
      const tempId = `temp_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🗄️ OnboardingPaste: Strategy 5 - Attempting database storage with ID:', tempId);
      
      const { error: tempError } = await supabase
        .from('onboarding_data')
        .insert({
          user_id: tempId,
          profile_data: profileData as unknown as Json,
          conversation_data: conversationData as unknown as Json,
          prompt_mode: promptMode,
          is_anonymous: true
        });
      
      if (!tempError) {
        localStorage.setItem('tempOnboardingId', tempId);
        console.log('✅ OnboardingPaste: Strategy 5 - Database storage successful with ID:', tempId);
      } else {
        console.error('❌ OnboardingPaste: Strategy 5 - Database storage failed:', tempError);
      }
      
      console.log('✅ OnboardingPaste: All enhanced data storage strategies completed');
      
      // Immediate verification
      const verification = {
        localStorage: {
          profile: !!localStorage.getItem('onboardingProfile'),
          userName: !!localStorage.getItem('onboardingUserName'),
          userNameValue: localStorage.getItem('onboardingUserName'),
          conversation: !!localStorage.getItem('onboardingConversation'),
          promptMode: !!localStorage.getItem('onboardingPromptMode'),
          promptModeValue: localStorage.getItem('onboardingPromptMode'),
          latestBackupKey: localStorage.getItem('latestBackupKey')
        },
        sessionStorage: {
          profile: !!sessionStorage.getItem('onboardingProfile'),
          backup: !!sessionStorage.getItem('onboardingBackup')
        },
        oauthPrefixed: {
          profile: !!localStorage.getItem('oauth_onboardingProfile'),
          userName: !!localStorage.getItem('oauth_onboardingUserName'),
          userNameValue: localStorage.getItem('oauth_onboardingUserName')
        },
        tempDatabase: {
          hasTempId: !!localStorage.getItem('tempOnboardingId'),
          tempIdValue: localStorage.getItem('tempOnboardingId')
        }
      };
      
      console.log('📊 OnboardingPaste: Storage verification completed:', verification);
      
      return true;
    } catch (error) {
      console.error('❌ OnboardingPaste: Error in enhanced storage:', error);
      console.error('❌ OnboardingPaste: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  };

  const generateProfile = async () => {
    if (!reflection.trim()) {
      toast({
        title: "Empty reflection",
        description: "Please paste your ChatGPT reflection before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🚀 OnboardingPaste: Starting profile generation...');
      console.log('📊 OnboardingPaste: Reflection length:', reflection.length);
      
      // Create a mock conversation structure for the edge function
      const mockConversation = {
        messages: [
          {
            role: "system",
            content: "You are analyzing a user's self-reflection to create their profile."
          },
          {
            role: "user", 
            content: `Here is my self-reflection: ${reflection}`
          }
        ]
      };

      console.log('🔄 OnboardingPaste: Calling generate-profile edge function...');
      
      // Call the existing generate-profile edge function
      const { data, error } = await supabase.functions.invoke('generate-profile', {
        body: { conversation: mockConversation }
      });

      if (error) {
        console.error('❌ OnboardingPaste: Profile generation error:', error);
        throw new Error(`Profile generation failed: ${error.message}`);
      }

      if (!data) {
        console.error('❌ OnboardingPaste: No profile data received');
        throw new Error('No profile data received');
      }

      console.log('✅ OnboardingPaste: Generated profile data received');
      console.log('📊 OnboardingPaste: Profile data keys:', Object.keys(data));
      
      // Use the profile data directly since it's already structured
      const profileData: UserProfile = {
        name: data.name || "You",
        location: data.location || "",
        interests: data.talkingPoints || [data.interestsAndPassions || ""],
        socialStyle: data.socialStyle || "",
        connectionPreferences: data.connectionPreferences || "",
        personalInsights: [
          data.vibeSummary || "",
          data.personalitySummary || "",
          data.coreValues || ""
        ].filter(insight => insight.trim() !== ""),
        vibeSummary: data.vibeSummary || reflection.substring(0, 500),
        twyneTags: data.twyneTags || ["#ReflectiveUser"],
        // Include all the additional fields from the AI response
        ...data
      };

      console.log('📊 OnboardingPaste: Final profile data:', {
        name: profileData.name,
        profileKeys: Object.keys(profileData),
        personalInsightsCount: profileData.personalInsights.length
      });

      setUserProfile(profileData);

      // Enhanced data storage with multiple strategies
      const conversationData = { 
        messages: mockConversation.messages,
        userAnswers: [reflection],
        source: 'gpt-paste',
        timestamp: Date.now()
      };
      
      const promptMode = 'gpt-paste';
      
      console.log('💾 OnboardingPaste: Storing onboarding data with enhanced strategies...');
      
      const storageSuccess = await storeOnboardingDataSecurely(profileData, conversationData, promptMode);
      
      if (!storageSuccess) {
        console.warn('⚠️ OnboardingPaste: Some storage strategies failed, but continuing...');
        toast({
          title: "Warning",
          description: "Profile generated but may not persist through authentication.",
          variant: "destructive",
        });
      }

      // If user is logged in, save the profile immediately
      if (user) {
        console.log('✅ OnboardingPaste: User is authenticated, saving to database...');
        console.log('📊 OnboardingPaste: Authenticated user:', {
          id: user.id,
          email: user.email
        });
        
        const { error: updateError } = await supabase
          .from('user_data')
          .upsert({
            user_id: user.id,
            profile_data: profileData as unknown as Json,
            conversation_data: conversationData as unknown as Json,
            prompt_mode: promptMode,
            has_completed_onboarding: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (updateError) {
          console.error("❌ OnboardingPaste: Error saving profile:", updateError);
          console.error("❌ OnboardingPaste: Save error details:", {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          });
          toast({
            title: "Profile generated but not saved",
            description: "Your profile was created but couldn't be saved to your account.",
            variant: "destructive",
          });
        } else {
          console.log('✅ OnboardingPaste: Profile saved successfully to database');
          clearNewUserFlag();
        }
      } else {
        console.log('⚠️ OnboardingPaste: User not authenticated, data stored securely for later transfer');
      }

      // Navigate to results page
      console.log('🚀 OnboardingPaste: Navigating to results page');
      navigate("/onboarding-results", { state: { userProfile: profileData } });
      
    } catch (error) {
      console.error("❌ OnboardingPaste: Error generating profile:", error);
      console.error("❌ OnboardingPaste: Generation error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: "Failed to generate your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Header with logo and back button */}
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo />
        <Button 
          variant="ghost" 
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to options
        </Button>
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Self-Reflection Import</h1>
          <p className="text-muted-foreground">
            Use ChatGPT's insights about you to quickly create your Twyne profile
          </p>
        </div>

        <Card className="mb-6 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-accent" />
              Step 1: Copy this prompt
            </CardTitle>
            <CardDescription>
              Ask ChatGPT this question and copy its response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-md relative">
              <p className="pr-8">{examplePrompt}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-3 right-3" 
                onClick={copyPrompt}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Step 2: Paste ChatGPT's response</CardTitle>
            <CardDescription>
              Paste the entire response below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste ChatGPT's response here..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[200px] p-4 focus:ring-primary focus:border-primary"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generateProfile} 
              disabled={isGenerating || !reflection.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  Creating your profile...
                </>
              ) : (
                "Create My Profile"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Not comfortable with this method? <Button variant="link" className="p-0" onClick={() => navigate("/onboarding-chat")}>Try the conversation approach</Button> instead.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPaste;
