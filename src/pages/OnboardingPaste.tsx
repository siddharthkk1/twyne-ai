
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Clipboard, ArrowLeft, Loader, User } from "lucide-react";
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
  const [userName, setUserName] = useState("");
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

  // Enhanced data storage with proper UUID generation and duplicate prevention
  const storeOnboardingDataSecurely = async (profileData: UserProfile, conversationData: any, promptMode: string) => {
    try {
      console.log('🚀 OnboardingPaste: Starting enhanced data storage with proper UUID...');
      console.log('📊 OnboardingPaste: Input data:', {
        profileName: profileData.name,
        profileKeys: Object.keys(profileData),
        conversationKeys: Object.keys(conversationData),
        promptMode: promptMode
      });
      
      const timestamp = Date.now();
      
      // Generate proper UUID for temp ID - using crypto.randomUUID() for better compatibility
      let tempId: string;
      try {
        tempId = crypto.randomUUID();
        console.log('🔑 OnboardingPaste: Generated UUID using crypto.randomUUID():', tempId);
      } catch (cryptoError) {
        // Fallback for older browsers
        console.warn('⚠️ OnboardingPaste: crypto.randomUUID() not available, using fallback');
        tempId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        console.log('🔑 OnboardingPaste: Generated fallback ID:', tempId);
      }
      
      const dataToStore = {
        profile: profileData,
        conversation: conversationData,
        userName: profileData.name,
        promptMode: promptMode,
        timestamp: timestamp,
        tempId: tempId
      };
      
      console.log('📊 OnboardingPaste: Consolidated data to store:', {
        hasProfile: !!dataToStore.profile,
        hasConversation: !!dataToStore.conversation,
        userName: dataToStore.userName,
        promptMode: dataToStore.promptMode,
        timestamp: dataToStore.timestamp,
        tempId: dataToStore.tempId
      });
      
      // Strategy 1: Check for existing session and clean up to prevent duplicates
      const existingSessionId = localStorage.getItem('temp_onboarding_id');
      if (existingSessionId && existingSessionId !== tempId) {
        console.log('🧹 OnboardingPaste: Found existing session, cleaning up duplicates:', existingSessionId);
        try {
          // Clean up existing database record
          const { error: deleteError } = await supabase
            .from('onboarding_data')
            .delete()
            .eq('id', existingSessionId)
            .eq('is_anonymous', true);
          
          if (deleteError) {
            console.warn('⚠️ OnboardingPaste: Failed to cleanup existing record:', deleteError);
          } else {
            console.log('✅ OnboardingPaste: Cleaned up existing database record');
          }
        } catch (cleanupError) {
          console.warn('⚠️ OnboardingPaste: Failed to cleanup existing record:', cleanupError);
        }
      }
      
      // Strategy 2: Standard localStorage storage with new session ID
      localStorage.setItem('temp_onboarding_id', tempId);
      localStorage.setItem('onboarding_profile', JSON.stringify(profileData));
      localStorage.setItem('onboarding_user_name', profileData.name);
      localStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
      localStorage.setItem('onboarding_prompt_mode', promptMode);
      localStorage.setItem('onboarding_timestamp', timestamp.toString());
      console.log('💾 OnboardingPaste: Standard localStorage completed with session ID:', tempId);
      
      // Strategy 3: Backup in sessionStorage
      sessionStorage.setItem('onboarding_profile', JSON.stringify(profileData));
      sessionStorage.setItem('onboarding_user_name', profileData.name);
      sessionStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
      sessionStorage.setItem('onboarding_prompt_mode', promptMode);
      sessionStorage.setItem('temp_onboarding_id', tempId);
      console.log('💾 OnboardingPaste: SessionStorage backup completed');
      
      // Strategy 4: Combined backup object with session ID
      const backupKey = `onboardingBackup_${tempId}`;
      localStorage.setItem(backupKey, JSON.stringify(dataToStore));
      localStorage.setItem('latestBackupKey', backupKey);
      sessionStorage.setItem('onboardingBackup', JSON.stringify(dataToStore));
      console.log('💾 OnboardingPaste: Combined backup completed with key:', backupKey);
      
      // Strategy 5: OAuth-ready prefixed storage
      localStorage.setItem('oauth_onboardingProfile', JSON.stringify(profileData));
      localStorage.setItem('oauth_onboardingUserName', profileData.name);
      localStorage.setItem('oauth_onboardingConversation', JSON.stringify(conversationData));
      localStorage.setItem('oauth_onboardingPromptMode', promptMode);
      localStorage.setItem('oauth_temp_onboarding_id', tempId);
      console.log('💾 OnboardingPaste: OAuth-prefixed storage completed');
      
      // Strategy 6: Store in temp database with proper UUID and duplicate prevention
      console.log('🗄️ OnboardingPaste: Attempting database storage with proper UUID:', tempId);
      
      // First check if a record with this ID already exists
      const { data: existingRecord } = await supabase
        .from('onboarding_data')
        .select('id')
        .eq('id', tempId)
        .single();
      
      if (existingRecord) {
        console.log('⚠️ OnboardingPaste: Record with this ID already exists, updating instead');
        const { error: updateError } = await supabase
          .from('onboarding_data')
          .update({
            profile_data: profileData as unknown as Json,
            conversation_data: conversationData as unknown as Json,
            prompt_mode: promptMode,
            is_anonymous: true
          })
          .eq('id', tempId);
        
        if (updateError) {
          console.error('❌ OnboardingPaste: Database update failed:', updateError);
          throw updateError;
        } else {
          console.log('✅ OnboardingPaste: Database record updated successfully');
        }
      } else {
        const { error: insertError } = await supabase
          .from('onboarding_data')
          .insert({
            id: tempId, // Use the proper UUID as id
            user_id: tempId, // Use the same UUID as user_id for anonymous records
            profile_data: profileData as unknown as Json,
            conversation_data: conversationData as unknown as Json,
            prompt_mode: promptMode,
            is_anonymous: true
          });
        
        if (insertError) {
          console.error('❌ OnboardingPaste: Database storage failed:', insertError);
          throw insertError;
        } else {
          console.log('✅ OnboardingPaste: Database storage successful with UUID:', tempId);
        }
      }
      
      console.log('✅ OnboardingPaste: All enhanced data storage strategies completed successfully');
      
      // Immediate verification
      const verification = {
        localStorage: {
          tempId: localStorage.getItem('temp_onboarding_id'),
          profile: !!localStorage.getItem('onboarding_profile'),
          userName: localStorage.getItem('onboarding_user_name'),
          conversation: !!localStorage.getItem('onboarding_conversation'),
          promptMode: localStorage.getItem('onboarding_prompt_mode'),
          latestBackupKey: localStorage.getItem('latestBackupKey')
        },
        sessionStorage: {
          tempId: sessionStorage.getItem('temp_onboarding_id'),
          profile: !!sessionStorage.getItem('onboarding_profile'),
          backup: !!sessionStorage.getItem('onboardingBackup')
        },
        oauthPrefixed: {
          tempId: localStorage.getItem('oauth_temp_onboarding_id'),
          profile: !!localStorage.getItem('oauth_onboardingProfile'),
          userName: localStorage.getItem('oauth_onboardingUserName')
        }
      };
      
      console.log('📊 OnboardingPaste: Storage verification completed:', verification);
      
      return tempId; // Return the session ID for reference
    } catch (error) {
      console.error('❌ OnboardingPaste: Error in enhanced storage:', error);
      console.error('❌ OnboardingPaste: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
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

    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🚀 OnboardingPaste: Starting profile generation with name:', userName);
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
      
      // Use the profile data directly since it's already structured, but ensure name is set
      const profileData: UserProfile = {
        name: userName.trim(), // Use the user-entered name
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

      // Ensure name is set to the user-entered value
      profileData.name = userName.trim();

      console.log('📊 OnboardingPaste: Final profile data:', {
        name: profileData.name,
        profileKeys: Object.keys(profileData),
        personalInsightsCount: profileData.personalInsights.length
      });

      setUserProfile(profileData);

      // Enhanced data storage with session management
      const conversationData = { 
        messages: mockConversation.messages,
        userAnswers: [reflection],
        source: 'gpt-paste',
        timestamp: Date.now()
      };
      
      const promptMode = 'gpt-paste';
      
      console.log('💾 OnboardingPaste: Storing onboarding data with session management...');
      
      try {
        const sessionId = await storeOnboardingDataSecurely(profileData, conversationData, promptMode);
        console.log('✅ OnboardingPaste: Data stored successfully with session ID:', sessionId);
      } catch (storageError) {
        console.error('❌ OnboardingPaste: Storage failed:', storageError);
        toast({
          title: "Storage Warning",
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

  // Add browser extension error handling
  React.useEffect(() => {
    // Suppress Zotero extension errors that appear in console
    const originalError = console.error;
    console.error = (...args) => {
      // Filter out Zotero extension errors
      const errorMessage = args.join(' ');
      if (errorMessage.includes('zotero://') || 
          errorMessage.includes('chrome-extension://') ||
          errorMessage.includes('moz-extension://') ||
          errorMessage.includes('Failed to load resource') && errorMessage.includes('extension')) {
        // Suppress these extension-related errors
        return;
      }
      // Let other errors through
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

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

        <Card className="mb-6 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              Step 2: Enter your name
            </CardTitle>
            <CardDescription>
              This will be used in your Twyne profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="focus:ring-primary focus:border-primary"
              required
            />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Step 3: Paste ChatGPT's response</CardTitle>
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
              required
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generateProfile} 
              disabled={isGenerating || !reflection.trim() || !userName.trim()} 
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
