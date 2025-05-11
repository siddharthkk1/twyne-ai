
import React from "react";
import { MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntroCard as IntroCardType } from "./types";
import { splitIntroText } from "./intro-utils";

interface IntroCardProps {
  intro: IntroCardType;
  onOpenWaitlist: () => void;
}

export const IntroCard: React.FC<IntroCardProps> = ({ intro, onOpenWaitlist }) => {
  const { firstPart, secondPart } = splitIntroText(intro.text, intro.isGroup);

  return (
    <div 
      className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20 animate-fade-in"
      style={{ 
        height: "240px",
        width: "100%"
      }}
    >
      {/* Group indicator for group intros */}
      {intro.isGroup && (
        <div className="mb-2 flex items-center text-primary">
          <Users size={16} className="mr-1" />
          <span className="text-xs font-medium">Group</span>
        </div>
      )}
      <p className="text-lg mb-2">
        {firstPart}
        {secondPart}
      </p>
      <div className="mt-auto flex items-center justify-between">
        <Button 
          onClick={onOpenWaitlist}
          variant="default" 
          size="sm"
          className="rounded-full w-auto self-end mb-3 hover:shadow-md transition-all"
        >
          <MessageCircle size={16} className="mr-1" />
          Connect & Say Hi
        </Button>
        <div className="mb-3 mr-2">
          {intro.icon}
        </div>
      </div>
    </div>
  );
};
