
import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (message.sender === "ai" && onMessagePartVisible) {
      onMessagePartVisible(() => {
        // This callback is used for scroll handling
      });
    }
  }, [message, onMessagePartVisible]);

  // Handle typing indicator
  if (message.sender === "typing") {
    return (
      <div className="flex">
        <div className="mr-2 mt-1 flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-primary text-xs font-medium p-0">
              <TwyneOrb size={24} pulsing={true} />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="chat-bubble-ai bg-background border border-border/50 shadow-sm backdrop-blur-sm rounded-2xl p-4 animate-pulse flex space-x-1 w-16">
          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animation-delay-200"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animation-delay-500"></div>
        </div>
      </div>
    );
  }

  const parts = message.text.split('||').map(part => part.trim());

  return (
    <div className={`flex ${message.sender === "user" ? "justify-end" : ""} mb-4`}>
      {/* AI Avatar */}
      {message.sender === "ai" && (
        <div className="mr-2 mt-1 flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-primary text-xs font-medium p-0">
              <TwyneOrb size={24} />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Message Content */}
      <div className={`${
        message.sender === "user" 
          ? "chat-bubble-user" 
          : "chat-bubble-ai bg-background border border-border/50 shadow-sm backdrop-blur-sm"
      } rounded-2xl p-4 max-w-[85%] ${
        message.sender === "user" ? "ml-auto" : "mr-auto"
      }`}>
        {parts.map((part, index) => (
          <div
            key={index}
            className={`text-sm leading-relaxed ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            {part}
          </div>
        ))}
      </div>

      {/* User Avatar */}
      {message.sender === "user" && (
        <div className="ml-2 mt-1 flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {nameInitial}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
