import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  nameInitial: string;
  onMessagePartVisible?: () => void;  // ✅ simplified to a notifier
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
      // Show first part immediately
      setVisibleParts([0]);
      onMessagePartVisible?.();

      // Show remaining parts with staggered delay
      messageParts.forEach((_, index) => {
        if (index > 0) {
          const baseDelay = 500 + Math.floor(Math.random() * 200);
          const incrementDelay = 500 + Math.floor(Math.random() * 200);
          const delay = baseDelay + index * incrementDelay;

          setTimeout(() => {
            setVisibleParts(prev => {
              const updated = [...prev, index];
              requestAnimationFrame(() => {
                onMessagePartVisible?.(); // Notify parent that new content is visible
              });
              return updated;
            });
          }, delay);
        }
      });
    } else {
      // For user messages, show all parts instantly
      setVisibleParts([...Array(messageParts.length).keys()]);
      onMessagePartVisible?.();
    }
  }, [message.id]); // ✅ only runs on new message

  return (
    <>
      {messageParts.map((part, index) => {
        if (!visibleParts.includes(index)) return null;

        const text = message.sender === "ai"
          ? personalizeMessage(part)
          : part;

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
              {text.trim()}
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
      })}
    </>
  );
};

export default MessageBubble;
