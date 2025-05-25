
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  nameInitial: string;
  onMessagePartVisible?: () => void;
  userName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  nameInitial,
  onMessagePartVisible,
  userName
}) => {
  const messageParts = message.sender === "ai" 
    ? message.text.split("||") 
    : [message.text];

  const [visibleParts, setVisibleParts] = useState<number[]>([]);

  const personalizeMessage = (text: string) => {
    if (!userName) return text;
    return text.replace(/{{name}}/g, userName);
  };

  useEffect(() => {
    if (message.sender === "ai") {
      setVisibleParts([0]);
      
      // Trigger scroll for the first part immediately
      setTimeout(() => {
        onMessagePartVisible?.();
      }, 100);

      const base = 500;
      const increment = 500;

      messageParts.forEach((_, index) => {
        if (index > 0) {
          const delay = base + increment * index;

          setTimeout(() => {
            setVisibleParts(prev => [...prev, index]);

            // Trigger scroll for each new part with a small delay to ensure DOM update
            setTimeout(() => {
              onMessagePartVisible?.();
            }, 50);
          }, delay);
        }
      });
    } else {
      // For user messages, show all parts immediately
      setVisibleParts([...Array(messageParts.length).keys()]);
      // No need to trigger scroll here - the auto-scroll hook handles user messages
    }
  }, [message.id, messageParts.length, message.sender, onMessagePartVisible]);

  const allMessageParts = messageParts.map((part, index) => {
    const isVisible = visibleParts.includes(index);
    if (!isVisible) return null;

    const personalizedText = message.sender === "ai" ? personalizeMessage(part) : part;

    return (
      <div
        key={`${message.id}-${index}`}
        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-2`}
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
          className={`
            ${message.sender === "user"
              ? "chat-bubble-user bg-primary/90 text-primary-foreground ml-auto shadow-lg"
              : "chat-bubble-ai bg-background border border-border/50 backdrop-blur-sm shadow-md"
            }
            rounded-2xl p-4 max-w-[85%] md:max-w-[70%]
            transition-opacity duration-300 opacity-100
          `}
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
