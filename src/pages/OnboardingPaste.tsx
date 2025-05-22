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

interface UserProfile {
  name: string;
  location: string;
  interests: string[] | string;
  socialStyle: string;
  connectionPreferences: string;
  personalInsights: string[];
  // Additional fields
  vibeSummary?: string;
  socialNeeds?: string;
  coreValues?: string;
  lifeContext?: string;
  twyneTags?: string[];
  vibeWords?: string[];
  goals?: string;
  // ...other fields from original UserProfile
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
      // OpenAI API key from the existing code
      const OPENAI_API_KEY = "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";

      // Profile generation system prompt adapted for reflection
      const SYSTEM_PROMPT = `
You are Twyne, a warm, emotionally intelligent AI that helps people connect with others who match their vibe.
The user has provided a reflection or self-description from ChatGPT, which contains insights about their personality, interests, values, and more.
Your task is to create a structured profile based on this reflection. It should be comprehensive but personal.
`;

      // Send to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Here is a self-reflection about me from ChatGPT: "${reflection}"` }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const profileText = data.choices[0].message.content;
      
      // Extract the JSON part
      let profileData: UserProfile;
      try {
        // Try to extract JSON if it's wrapped in text
        const jsonMatch = profileText.match(/(\{[\s\S]*\})/);
        const jsonString = jsonMatch ? jsonMatch[0] : profileText;
        profileData = JSON.parse(jsonString);
      } catch (error) {
        console.error("Error parsing AI profile:", error);
        // As a fallback, create a basic profile with the reflection as the summary
        profileData = {
          name: "You",
          location: "",
          interests: [],
          socialStyle: "",
          connectionPreferences: "",
          personalInsights: [],
          vibeSummary: reflection.substring(0, 500),
          twyneTags: ["#ReflectiveUser"]
        };
      }

      setUserProfile(profileData);

      // If user is logged in, save the profile
      if (user) {
        await supabase.auth.updateUser({
          data: { 
            has_onboarded: true,
            profile_data: profileData,
            reflection_data: reflection
          }
        });
        clearNewUserFlag();
      }

      // Navigate to results page
      navigate("/onboarding-results", { state: { userProfile: profileData } });
    } catch (error) {
      console.error("Error generating profile:", error);
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
