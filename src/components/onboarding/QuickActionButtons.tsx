
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, SkipForward } from "lucide-react";

interface QuickActionButtonsProps {
  handleSend: (message?: string) => void;
  isDisabled: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ handleSend, isDisabled }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <Button
        variant="outline" 
        size="sm"
        onClick={() => handleSend("Not really")}
        disabled={isDisabled}
        className="bg-background/70 backdrop-blur-sm border border-border/50 hover:bg-accent/10 transition-all duration-200 rounded-full text-sm shadow-sm"
      >
        <SkipForward className="h-3 w-3 mr-1" /> 
        Not really
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSend("I'm not sure")}
        disabled={isDisabled}
        className="bg-background/70 backdrop-blur-sm border border-border/50 hover:bg-accent/10 transition-all duration-200 rounded-full text-sm shadow-sm"
      >
        <MessageCircle className="h-3 w-3 mr-1" /> 
        I'm not sure
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSend("This isn't really that important to me tbh, can we talk about something else?")}
        disabled={isDisabled}
        className="bg-background/70 backdrop-blur-sm border border-border/50 hover:bg-accent/10 transition-all duration-200 rounded-full text-sm shadow-sm whitespace-normal"
      >
        <MessageCircle className="h-3 w-3 mr-1" /> 
        This isn't really that important to me tbh, can we talk about something else?
      </Button>
    </div>
  );
};

export default QuickActionButtons;
