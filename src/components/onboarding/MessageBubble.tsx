
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  nameInitial: string;
  onMessagePartVisible?: (updateMessages: () => void) => void;
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
    return userName ? text.replace(/{{name}}/g, userName) : text;
  };

  useEffect(() => {
    if (message.sender === "ai") {
      setVisibleParts([0]);

      // Trigger scroll for first part immediately
      if (onMessagePartVisible) {
        onMessagePartVisible(() => {
          // No-op since state is already being updated
        });
      }

      messageParts.forEach((_, index) => {
        if (index > 0) {
          const delay = 500 + index * (300 + Math.random() * 200);

          setTimeout(() => {
            setVisibleParts(prev => {
              const updated = [...prev, index];
              
              // Trigger scroll for each new part
              if (onMessagePartVisible) {
                requestAnimationFrame(() => {
                  onMessagePartVisible(() => {
                    // No-op since state is already being updated
                  });
                });
              }
              
              return updated;
            });
          }, delay);
        }
      });
    } else {
      // For user messages, show all parts immediately
      setVisibleParts([...Array(messageParts.length).keys()]);
      
      // Trigger immediate scroll for user messages
      if (onMessagePartVisible) {
        onMessagePartVisible(() => {
          // No-op since state is already being updated
        });
      }
    }
  }, [message.id]);

  return (
    <>
      {messageParts.map((part, index) =>
        visibleParts.includes(index) ? (
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
              {personalizeMessage(part).trim()}
            </div>
            {message.sender === "user" && (
              <div className="ml-2 mt-1 flex-shrink-0">
                <Avatar className="h-8 w-8 bg-muted">
                  <AvatarFallback>{nameInitial}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ) : null
      )}
    </>
  );
};

export default MessageBubble;
