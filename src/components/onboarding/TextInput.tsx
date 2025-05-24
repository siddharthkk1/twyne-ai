
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send } from "lucide-react";

interface TextInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: () => void;
  isDisabled: boolean;
  switchToVoiceMode: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ 
  input, 
  setInput, 
  handleSend, 
  isDisabled, 
  switchToVoiceMode 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevIsDisabledRef = useRef(isDisabled);

  // Auto-focus when component becomes enabled (after sending message)
  useEffect(() => {
    if (prevIsDisabledRef.current && !isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
    prevIsDisabledRef.current = isDisabled;
  }, [isDisabled]);

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current && !isDisabled) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <>
      <Textarea
        ref={textareaRef}
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isDisabled && input.trim()) {
              handleSend();
            }
          }
        }}
        disabled={isDisabled}
        className="rounded-2xl shadow-sm bg-background/70 backdrop-blur-sm border border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 min-h-[44px]"
        style={{ 
          maxHeight: '150px',
          lineHeight: '1.5',
          padding: '10px 14px'
        }}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={isDisabled || !input.trim()}
        className="rounded-full shadow-md bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-200"
      >
        <Send size={18} />
      </Button>
      {/* Toggle to voice mode */}
      <Button
        size="icon"
        variant="outline"
        onClick={switchToVoiceMode}
        className="rounded-full border-muted"
      >
        <Mic size={18} />
      </Button>
    </>
  );
};

export default TextInput;
