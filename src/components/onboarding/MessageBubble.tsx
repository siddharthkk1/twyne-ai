
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  nameInitial: string;
  onMessagePartVisible?: () => void;
  userName?: string; // Add userName prop
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  nameInitial,
  onMessagePartVisible,
  userName
}) => {
  // Split message text by || divider to create multiple message bubbles
  const messageParts = message.sender === "ai" 
    ? message.text.split("||") 
    : [message.text];
  
  // State to track which parts of the message are visible
  const [visibleParts, setVisibleParts] = useState<number[]>([]);

  // Personalize AI messages by replacing {{name}} placeholder with actual name if provided
  const personalizeMessage = (text: string) => {
    if (!userName || userName === "") return text;
    return text.replace(/{{name}}/g, userName);
  };

  // Add staggered appearance effect for AI messages with slightly varied delays
  useEffect(() => {
    if (message.sender === "ai") {
      // Show first part immediately
      setVisibleParts([0]);
      // Trigger scroll for first bubble
      onMessagePartVisible?.();
      
      // Show subsequent parts with varied delays
      messageParts.forEach((_, index) => {
        if (index > 0) {
          // Add slight variation to delays (between 500-700ms base + index * 500-700ms)
          const baseDelay = 500 + Math.floor(Math.random() * 200);
          const incrementDelay = 500 + Math.floor(Math.random() * 200);
          const delay = baseDelay + (index * incrementDelay);
          
          setTimeout(() => {
            setVisibleParts(prev => {
              const newParts = [...prev, index];
              // Trigger scroll callback when bubble appears
              onMessagePartVisible?.();
              return newParts;
            });
          }, delay);
        }
      });
    } else {
      // Show user messages immediately
      setVisibleParts([...Array(messageParts.length).keys()]);
      // Trigger scroll for user message
      onMessagePartVisible?.();
    }
  }, [message.id, messageParts.length, message.sender, onMessagePartVisible]);

  // Create placeholder divs for parts that will be visible later to prevent layout shifts
  const allMessageParts = messageParts.map((part, index) => {
    const isVisible = visibleParts.includes(index);
    const personalizedText = message.sender === "ai" ? personalizeMessage(part) : part;
    
    return (
      <div
        key={`${message.id}-${index}`}
        className={`flex ${
          message.sender === "user" ? "justify-end" : "justify-start"
        } mb-2`}
        style={!isVisible ? { 
          visibility: 'hidden', 
          height: '0px', 
          margin: '0px',
          opacity: 0 
        } : {
          opacity: 1,
          transition: 'opacity 0.3s ease-in'
        }}
      >
        {message.sender === "ai" && (
          <div className="mr-2 mt-1 flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-primary text-xs font-medium p-0">
                <TwyneOrb size={24} />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <div
          className={`${
            message.sender === "user" 
              ? "chat-bubble-user bg-primary/90 text-primary-foreground ml-auto shadow-lg" 
              : "chat-bubble-ai bg-background border border-border/50 backdrop-blur-sm shadow-md"
          } rounded-2xl p-4 max-w-[85%] md:max-w-[70%]`}
        >
          {personalizedText.trim()}
        </div>
        {message.sender === "user" && (
          <div className="ml-2 mt-1 flex-shrink-0">
            <Avatar className="h-8 w-8 bg-muted">
              <AvatarFallback>{nameInitial}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  });

  return <>{allMessageParts}</>;
};

export default MessageBubble;
