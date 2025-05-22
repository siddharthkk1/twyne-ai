
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";

interface PromptModeSelectorProps {
  handlePromptSelection: (mode: "structured" | "playful") => void;
}

const PromptModeSelector: React.FC<PromptModeSelectorProps> = ({ handlePromptSelection }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 p-4">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Choose Your Conversation Style</h1>
          <p className="text-muted-foreground">Select how Twyne will chat with you during onboarding</p>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => handlePromptSelection("structured")}
            className="border rounded-xl p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium group-hover:text-primary transition-colors">Guided Conversation</h3>
                <p className="text-sm text-muted-foreground">A thoughtful, structured conversation that explores your interests, values, and connection style.</p>
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptSelection("structured");
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handlePromptSelection("playful")}
            className="border rounded-xl p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium group-hover:text-primary transition-colors">Playful Chat</h3>
                <p className="text-sm text-muted-foreground">A breezy, fun conversation with quirky questions to bring out your authentic personality.</p>
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromptSelection("playful");
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Both options help us understand your vibe and who you might connect with best.</p>
        </div>
      </div>
    </div>
  );
};

export default PromptModeSelector;
