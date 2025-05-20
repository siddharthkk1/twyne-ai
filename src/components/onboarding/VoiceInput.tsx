
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  isListening: boolean;
  toggleVoiceInput: () => void;
  isDisabled: boolean;
  switchToTextMode: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  isListening, 
  toggleVoiceInput, 
  isDisabled,
  switchToTextMode
}) => {
  return (
    <>
      <div className="flex-1 h-[44px] flex items-center justify-center rounded-2xl shadow-sm bg-background/70 backdrop-blur-sm border border-border/50 px-4">
        <p className="text-muted-foreground">
          {isListening ? "Listening..." : "Click mic to speak"}
        </p>
      </div>
      <Button
        size="icon"
        onClick={toggleVoiceInput}
        disabled={isDisabled}
        className={`rounded-full shadow-md ${
          isListening 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-gradient-to-r from-accent to-accent/80 hover:opacity-90"
        } transition-all duration-200`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>
      {/* Toggle to text mode */}
      <Button
        size="icon"
        variant="outline"
        onClick={switchToTextMode}
        className="rounded-full border-muted"
      >
        <MessageCircle size={18} />
      </Button>
    </>
  );
};

export default VoiceInput;
