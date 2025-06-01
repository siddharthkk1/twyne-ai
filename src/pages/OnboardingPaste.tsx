
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Clipboard, ArrowLeft, Loader, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { storeOnboardingDataSecurely } from "@/utils/onboardingStorage";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, clearNewUserFlag } = useAuth();
  const { saveOnboardingData, cleanupOnboardingData } = useSupabaseSync();

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
            role: "system" as const,
            content: "You are analyzing a user's self-reflection to create their profile."
          },
          {
            role: "user" as const, 
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

      // Use the shared storage utility function
      const conversationData = mockConversation;
      const promptMode = 'gpt-paste';
      
      console.log('💾 OnboardingPaste: Storing onboarding data with shared utility...');
      
      try {
        const storageResult = await storeOnboardingDataSecurely(profileData, conversationData, promptMode);
        
        if (storageResult.success) {
          console.log('✅ OnboardingPaste: Data stored successfully with session ID:', storageResult.sessionId);
        } else {
          console.error('❌ OnboardingPaste: Storage failed:', storageResult.error);
          toast({
            title: "Storage Warning",
            description: "Profile generated but may not persist through authentication.",
            variant: "destructive",
          });
        }
      } catch (storageError) {
        console.error('❌ OnboardingPaste: Storage failed:', storageError);
        toast({
          title: "Storage Warning",
          description: "Profile generated but may not persist through authentication.",
          variant: "destructive",
        });
      }

      // If user is logged in, save the profile immediately using the sync hook
      if (user) {
        console.log('✅ OnboardingPaste: User is authenticated, saving to database...');
        
        try {
          await saveOnboardingData(profileData, conversationData, promptMode, user, clearNewUserFlag);
          console.log('✅ OnboardingPaste: Profile saved successfully to database');
        } catch (saveError) {
          console.error("❌ OnboardingPaste: Error saving profile:", saveError);
          toast({
            title: "Profile generated but not saved",
            description: "Your profile was created but couldn't be saved to your account.",
            variant: "destructive",
          });
        }
      } else {
        console.log('⚠️ OnboardingPaste: User not authenticated, data stored securely for later transfer');
      }

      // Navigate to results page
      console.log('🚀 OnboardingPaste: Navigating to results page');
      navigate("/onboarding-results", { state: { userProfile: profileData } });
      
    } catch (error) {
      console.error("❌ OnboardingPaste: Error generating profile:", error);
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
