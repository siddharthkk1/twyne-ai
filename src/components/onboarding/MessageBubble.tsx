
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  nameInitial: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, nameInitial }) => {
  return (
    <div
      key={message.id}
      className={`animate-fade-in flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
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
        } rounded-2xl p-4 max-w-[85%] md:max-w-[70%] transition-all duration-200`}
      >
        {message.text}
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
};

export default MessageBubble;
