
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Mic } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface VoiceInputProps {
  isListening: boolean;
  toggleVoiceInput: () => void;
  isDisabled: boolean;
  isProcessing: boolean; 
  switchToTextMode: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  isListening, 
  toggleVoiceInput, 
  isDisabled,
  isProcessing,
  switchToTextMode
}) => {
  const handleVoiceClick = () => {
    toast({
      title: "Voice Input Coming Soon",
      description: "Voice input is being developed and will be available in a future update. Please use text input for now.",
    });
  };

  return (
    <>
      <div className="flex-1 h-[44px] flex items-center justify-center rounded-2xl shadow-sm bg-background/70 backdrop-blur-sm border border-border/50 px-4">
        <p className="text-muted-foreground">
          Voice input coming soon - use text for now
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={handleVoiceClick}
              disabled={isDisabled}
              className="rounded-full shadow-md bg-gradient-to-r from-accent to-accent/80 hover:opacity-90 transition-all duration-200"
            >
              <Mic size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Voice input coming soon
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Toggle to text mode */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              onClick={switchToTextMode}
              className="rounded-full border-muted"
            >
              <MessageCircle size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Switch to text mode
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default VoiceInput;
