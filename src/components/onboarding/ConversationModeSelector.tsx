
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversationModeSelectorProps {
  handleModeSelection: (mode: "text" | "voice") => void;
}

const ConversationModeSelector: React.FC<ConversationModeSelectorProps> = ({
  handleModeSelection,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5 relative">
      {/* Back button positioned at the top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      
      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">How would you like to chat?</h1>
          <p className="text-muted-foreground mb-8">
            Choose your preferred way to communicate
          </p>
          
          <div className="flex flex-col space-y-4">
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2 h-16 text-lg"
              onClick={() => handleModeSelection("text")}
            >
              <MessageSquare className="h-5 w-5" />
              Type messages
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2 h-16 text-lg"
              onClick={() => handleModeSelection("voice")}
            >
              <Mic className="h-5 w-5" />
              Use voice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationModeSelector;
