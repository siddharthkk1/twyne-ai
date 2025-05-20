
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Mic, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversationModeSelectorProps {
  handleModeSelection: (mode: "text" | "voice") => void;
}

const ConversationModeSelector: React.FC<ConversationModeSelectorProps> = ({ handleModeSelection }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Back button positioned at top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Centered content - using flex-1 and flex items-center to center vertically */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose your conversation style</h2>
            <p className="text-muted-foreground">
              How would you prefer to chat with Twyne?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Button
              onClick={() => handleModeSelection("text")}
              variant="outline"
              className="flex flex-col items-center justify-center h-40 p-6 bg-background hover:bg-background/90 border-primary/20 hover:border-primary/40"
            >
              <MessageCircle className="h-8 w-8 mb-4 text-primary" />
              <span className="text-lg font-medium">Text Chat</span>
              <span className="text-sm text-muted-foreground mt-2">Type your responses</span>
            </Button>
            
            <Button
              onClick={() => handleModeSelection("voice")}
              variant="outline"
              className="flex flex-col items-center justify-center h-40 p-6 bg-accent/5 hover:bg-accent/10 border-accent/20 hover:border-accent/40"
            >
              <Mic className="h-8 w-8 mb-4 text-accent" />
              <span className="text-lg font-medium">Voice Chat</span>
              <span className="text-sm text-muted-foreground mt-2">Speak your responses</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationModeSelector;
