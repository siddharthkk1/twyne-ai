
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clipboard, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

const OnboardingSelection = () => {
  const navigate = useNavigate();

  const handleSelectConversation = () => {
    navigate("/onboarding-chat");
  };

  const handleSelectGptReflection = () => {
    navigate("/onboarding-paste");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Header with logo */}
      <div className="container mx-auto px-4 py-6">
        <Logo />
      </div>
      
      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How would you like to be understood?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose how Twyne gets to know you so we can connect you with people who match your vibe.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Conversation with AI */}
          <Card className="border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Have a friendly chat with Twyne AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Perfect if you:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Prefer a guided, conversational approach</li>
                <li>Want to explore different aspects of yourself</li>
                <li>Enjoy a more personal interaction</li>
                <li>Have 5-10 minutes to chat</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSelectConversation} className="w-full mt-4 group">
                Start Conversation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Option 2: ChatGPT Self-Reflection Paste */}
          <Card className="border border-accent/20 shadow-md hover:shadow-lg transition-all duration-300 hover:border-accent/40">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Clipboard className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>ChatGPT Self-Reflection</CardTitle>
              <CardDescription>Use your existing ChatGPT insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Perfect if you:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Already use ChatGPT frequently</li>
                <li>Want a quicker onboarding experience</li>
                <li>Have chatted about yourself with ChatGPT before</li>
                <li>Prefer to skip the questions</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSelectGptReflection} 
                variant="outline" 
                className="w-full mt-4 border-accent/30 bg-accent/5 text-foreground hover:bg-accent/10 group"
              >
                Try Quick Import
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Not ready to decide? <Link to="/" className="text-primary hover:underline">Return to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSelection;
