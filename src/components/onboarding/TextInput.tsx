
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface TextInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (message?: string) => void;
  isDisabled: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ 
  input, 
  setInput, 
  handleSend, 
  isDisabled
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDisabled) {
      handleSend();
      // Auto-focus the textarea after sending a message
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // Auto-focus when component becomes enabled (after AI responds)
  useEffect(() => {
    if (!isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  return (
    <>
      <form onSubmit={handleSubmit} className="flex-1 flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            disabled={isDisabled}
            className="w-full min-h-[44px] max-h-32 resize-none rounded-2xl shadow-sm bg-background/70 backdrop-blur-sm border border-border/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isDisabled}
          className="rounded-full shadow-md bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200"
        >
          <Send size={18} />
        </Button>
      </form>
    </>
  );
};

export default TextInput;
