
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

  // Enhanced data storage with aggressive duplicate prevention and proper session management
  const storeOnboardingDataSecurely = async (profileData: UserProfile, conversationData: any, promptMode: string) => {
    try {
      console.log('🚀 OnboardingPaste: Starting enhanced data storage with aggressive duplicate prevention...');
      console.log('📊 OnboardingPaste: Input data:', {
        profileName: profileData.name,
        profileKeys: Object.keys(profileData),
        conversationKeys: Object.keys(conversationData),
        conversationMessageCount: conversationData?.messages?.length || 0,
        conversationUserAnswerCount: conversationData?.userAnswers?.length || 0,
        promptMode: promptMode
      });
      
      const timestamp = Date.now();
      
      // Enhanced cleanup: Remove ALL existing anonymous sessions first
      console.log('🧹 OnboardingPaste: Performing aggressive cleanup of existing anonymous sessions...');
      
      // Get existing session ID and clean up aggressively
      const existingSessionId = localStorage.getItem('temp_onboarding_id');
      if (existingSessionId) {
        console.log('🗄️ OnboardingPaste: Found existing session, performing comprehensive cleanup:', existingSessionId);
        
        try {
          // Clean up ALL records that could be related to this session
          const { error: deleteError } = await supabase
            .from('onboarding_data')
            .delete()
            .or(`id.eq.${existingSessionId},user_id.eq.${existingSessionId}`)
            .eq('is_anonymous', true);
          
          if (deleteError) {
            console.warn('⚠️ OnboardingPaste: Failed to cleanup existing session records:', deleteError);
          } else {
            console.log('✅ OnboardingPaste: Successfully cleaned up existing session records');
          }
        } catch (cleanupError) {
          console.warn('⚠️ OnboardingPaste: Error during session cleanup:', cleanupError);
        }
      }
      
      // Also clean up any stale anonymous records (older than 1 hour) to prevent accumulation
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { error: staleCleanupError } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('is_anonymous', true)
          .lt('created_at', oneHourAgo);
        
        if (staleCleanupError) {
          console.warn('⚠️ OnboardingPaste: Failed to cleanup stale records:', staleCleanupError);
        } else {
          console.log('✅ OnboardingPaste: Successfully cleaned up stale anonymous records');
        }
      } catch (staleCleanupError) {
        console.warn('⚠️ OnboardingPaste: Error during stale cleanup:', staleCleanupError);
      }
      
      // Generate proper UUID for the session
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
      
      // Enhanced storage strategy with comprehensive backup
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
        tempId: dataToStore.tempId,
        conversationMessageCount: conversationData?.messages?.length || 0,
        conversationUserAnswerCount: conversationData?.userAnswers?.length || 0
      });
      
      // Clear previous localStorage entries to prevent conflicts
      const keysToRemove = [
        'temp_onboarding_id',
        'onboarding_profile',
        'onboarding_user_name',
        'onboarding_conversation',
        'onboarding_prompt_mode',
        'onboarding_timestamp',
        'latestBackupKey'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 OnboardingPaste: Cleared existing localStorage key: ${key}`);
        }
      });
      
      // Store with new session ID
      localStorage.setItem('temp_onboarding_id', tempId);
      localStorage.setItem('onboarding_profile', JSON.stringify(profileData));
      localStorage.setItem('onboarding_user_name', profileData.name);
      localStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
      localStorage.setItem('onboarding_prompt_mode', promptMode);
      localStorage.setItem('onboarding_timestamp', timestamp.toString());
      console.log('💾 OnboardingPaste: Enhanced localStorage completed with session ID:', tempId);
      
      // Enhanced sessionStorage backup
      sessionStorage.setItem('onboarding_profile', JSON.stringify(profileData));
      sessionStorage.setItem('onboarding_user_name', profileData.name);
      sessionStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
      sessionStorage.setItem('onboarding_prompt_mode', promptMode);
      sessionStorage.setItem('temp_onboarding_id', tempId);
      sessionStorage.setItem('onboardingBackup', JSON.stringify(dataToStore));
      console.log('💾 OnboardingPaste: Enhanced sessionStorage backup completed');
      
      // Enhanced database storage with upsert to prevent duplicates
      console.log('🗄️ OnboardingPaste: Attempting database storage with proper UUID:', tempId);
      
      const insertData = {
        id: tempId,
        user_id: tempId,
        profile_data: profileData as unknown as Json,
        conversation_data: conversationData as unknown as Json,
        prompt_mode: promptMode,
        is_anonymous: true
      };
      
      console.log('📊 OnboardingPaste: Database insert data:', {
        id: insertData.id,
        user_id: insertData.user_id,
        profileDataKeys: Object.keys(profileData),
        conversationDataKeys: Object.keys(conversationData),
        prompt_mode: insertData.prompt_mode,
        is_anonymous: insertData.is_anonymous,
        conversationMessageCount: conversationData?.messages?.length || 0,
        conversationUserAnswerCount: conversationData?.userAnswers?.length || 0
      });
      
      // Use upsert to prevent duplicate records
      const { error, data } = await supabase
        .from('onboarding_data')
        .upsert(
          insertData,
          {
            onConflict: 'id',
            ignoreDuplicates: false
          }
        )
        .select();
      
      if (error) {
        console.error('❌ OnboardingPaste: Database storage failed:', error);
        throw error;
      } else {
        console.log('✅ OnboardingPaste: Database storage successful with UUID:', tempId);
        console.log('📊 OnboardingPaste: Database result:', {
          dataReturned: !!data,
          recordCount: data?.length || 0,
          savedData: data?.[0] ? {
            hasProfileData: !!data[0].profile_data,
            hasConversationData: !!data[0].conversation_data,
            promptMode: data[0].prompt_mode,
            isAnonymous: data[0].is_anonymous
          } : null
        });
      }
      
      console.log('✅ OnboardingPaste: All enhanced data storage strategies completed successfully');
      
      // Immediate verification
      const verification = {
        localStorage: {
          tempId: localStorage.getItem('temp_onboarding_id'),
          profile: !!localStorage.getItem('onboarding_profile'),
          userName: localStorage.getItem('onboarding_user_name'),
          conversation: !!localStorage.getItem('onboarding_conversation'),
          promptMode: localStorage.getItem('onboarding_prompt_mode')
        },
        sessionStorage: {
          tempId: sessionStorage.getItem('temp_onboarding_id'),
          profile: !!sessionStorage.getItem('onboarding_profile'),
          backup: !!sessionStorage.getItem('onboardingBackup')
        }
      };
      
      console.log('📊 OnboardingPaste: Storage verification completed:', verification);
      
      return tempId;
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
        ],
        userAnswers: [reflection],
        source: 'gpt-paste',
        timestamp: Date.now()
      };

      console.log('🔄 OnboardingPaste: Calling generate-profile edge function...');
      console.log('📊 OnboardingPaste: Mock conversation data:', {
        messageCount: mockConversation.messages.length,
        userAnswerCount: mockConversation.userAnswers.length,
        source: mockConversation.source
      });
      
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
        name: userName.trim(),
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
      const conversationData = mockConversation;
      const promptMode = 'gpt-paste';
      
      console.log('💾 OnboardingPaste: Storing onboarding data with enhanced session management...');
      console.log('📊 OnboardingPaste: Conversation data to store:', {
        messageCount: conversationData.messages.length,
        userAnswerCount: conversationData.userAnswers.length,
        source: conversationData.source,
        hasTimestamp: !!conversationData.timestamp
      });
      
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

      // If user is logged in, save the profile immediately with enhanced error handling
      if (user) {
        console.log('✅ OnboardingPaste: User is authenticated, saving to database...');
        console.log('📊 OnboardingPaste: Authenticated user:', {
          id: user.id,
          email: user.email
        });
        
        const saveData = {
          user_id: user.id,
          profile_data: profileData as unknown as Json,
          conversation_data: conversationData as unknown as Json,
          prompt_mode: promptMode,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        };
        
        console.log('📊 OnboardingPaste: Data to save for authenticated user:', {
          userId: saveData.user_id,
          hasProfileData: !!saveData.profile_data,
          hasConversationData: !!saveData.conversation_data,
          promptMode: saveData.prompt_mode,
          hasCompletedOnboarding: saveData.has_completed_onboarding
        });
        
        const { error: updateError, data: savedData } = await supabase
          .from('user_data')
          .upsert(
            saveData,
            {
              onConflict: 'user_id',
              ignoreDuplicates: false
            }
          )
          .select();

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
          console.log('📊 OnboardingPaste: Saved data verification:', {
            dataReturned: !!savedData,
            recordCount: savedData?.length || 0,
            savedRecord: savedData?.[0] ? {
              hasProfileData: !!savedData[0].profile_data,
              hasConversationData: !!savedData[0].conversation_data,
              promptMode: savedData[0].prompt_mode,
              hasCompletedOnboarding: savedData[0].has_completed_onboarding
            } : null
          });
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
