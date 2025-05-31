
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

  // Enhanced localStorage storage with verification
  const storeOnboardingDataSecurely = async (profileData: UserProfile, conversationData: any, promptMode: string) => {
    try {
      console.log('OnboardingPaste: Storing data in localStorage...');
      
      // Store data with timestamp for verification
      const timestamp = Date.now();
      const dataToStore = {
        profile: profileData,
        conversation: conversationData,
        userName: profileData.name || "",
        promptMode: promptMode,
        timestamp: timestamp
      };
      
      // Store individual items
      localStorage.setItem('onboardingProfile', JSON.stringify(profileData));
      localStorage.setItem('onboardingUserName', profileData.name || "");
      localStorage.setItem('onboardingConversation', JSON.stringify(conversationData));
      localStorage.setItem('onboardingPromptMode', promptMode);
      localStorage.setItem('onboardingTimestamp', timestamp.toString());
      
      // Store a backup combined object
      localStorage.setItem('onboardingDataBackup', JSON.stringify(dataToStore));
      
      console.log('OnboardingPaste: Data stored successfully');
      
      // Verify storage immediately
      const verifyProfile = localStorage.getItem('onboardingProfile');
      const verifyUserName = localStorage.getItem('onboardingUserName');
      const verifyConversation = localStorage.getItem('onboardingConversation');
      const verifyPromptMode = localStorage.getItem('onboardingPromptMode');
      
      console.log('OnboardingPaste: Storage verification:', {
        profile: !!verifyProfile,
        userName: !!verifyUserName,
        conversation: !!verifyConversation,
        promptMode: !!verifyPromptMode
      });
      
      if (!verifyProfile || !verifyPromptMode) {
        throw new Error('Failed to verify localStorage storage');
      }
      
      return true;
    } catch (error) {
      console.error('OnboardingPaste: Error storing to localStorage:', error);
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
      console.log('OnboardingPaste: Starting profile generation...');
      
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

      console.log('OnboardingPaste: Calling generate-profile edge function...');
      
      // Call the existing generate-profile edge function
      const { data, error } = await supabase.functions.invoke('generate-profile', {
        body: { conversation: mockConversation }
      });

      if (error) {
        throw new Error(`Profile generation failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No profile data received');
      }

      console.log('OnboardingPaste: Generated profile data:', data);
      
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

      setUserProfile(profileData);

      // Enhanced localStorage storage
      const conversationData = { 
        messages: mockConversation.messages,
        userAnswers: [reflection],
        source: 'gpt-paste',
        timestamp: Date.now()
      };
      
      const promptMode = 'gpt-paste';
      
      console.log('OnboardingPaste: Storing onboarding data...');
      
      const storageSuccess = await storeOnboardingDataSecurely(profileData, conversationData, promptMode);
      
      if (!storageSuccess) {
        console.warn('OnboardingPaste: Failed to store data in localStorage');
        toast({
          title: "Warning",
          description: "Profile generated but may not persist through authentication.",
          variant: "destructive",
        });
      }

      // If user is logged in, save the profile immediately
      if (user) {
        console.log('OnboardingPaste: User is authenticated, saving to database...');
        
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
          console.error("OnboardingPaste: Error saving profile:", updateError);
          toast({
            title: "Profile generated but not saved",
            description: "Your profile was created but couldn't be saved to your account.",
            variant: "destructive",
          });
        } else {
          console.log('OnboardingPaste: Profile saved successfully to database');
          clearNewUserFlag();
        }
      } else {
        console.log('OnboardingPaste: User not authenticated, data stored in localStorage for later transfer');
      }

      // Navigate to results page
      navigate("/onboarding-results", { state: { userProfile: profileData } });
      
    } catch (error) {
      console.error("OnboardingPaste: Error generating profile:", error);
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
