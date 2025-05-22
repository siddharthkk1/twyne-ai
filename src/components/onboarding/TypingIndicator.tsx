
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TwyneOrb from "@/components/ui/TwyneOrb";

const TypingIndicator: React.FC = () => {
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
};

export default TypingIndicator;
