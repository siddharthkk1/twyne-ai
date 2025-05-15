
import React from "react";
import { MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntroCard as IntroCardType } from "./types";
import { splitIntroText } from "./intro-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface IntroCardProps {
  intro: IntroCardType;
  onOpenWaitlist: () => void;
}

export const IntroCard: React.FC<IntroCardProps> = ({ intro, onOpenWaitlist }) => {
  const { firstPart, secondPart } = splitIntroText(intro.text, intro.isGroup);
  const isMobile = useIsMobile();

  // Function to highlight "You and [name]" or "You, [name], and [name]" patterns
  const formatText = (text: string) => {
    // For "You and [Name]" pattern
    const youAndPattern = /^(You and )([A-Za-z]+)/;
    // For "You, [Name], and [Name]" pattern
    const youAndMultiplePattern = /^(You, )([A-Za-z]+)(, and )([A-Za-z]+)/;
    
    if (youAndMultiplePattern.test(text)) {
      const matches = text.match(youAndMultiplePattern);
      if (matches && matches.length >= 5) {
        return (
          <>
            <strong>{matches[1]}{matches[2]}{matches[3]}{matches[4]}</strong>
            {text.substring(matches[0].length)}
          </>
        );
      }
    } else if (youAndPattern.test(text)) {
      const matches = text.match(youAndPattern);
      if (matches && matches.length >= 3) {
        return (
          <>
            <strong>{matches[1]}{matches[2]}</strong>
            {text.substring(matches[0].length)}
          </>
        );
      }
    }
    
    return text;
  };

  return (
    <div 
      className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20 animate-fade-in w-full"
      style={{ height: "240px" }}
    >
      {/* Group indicator for group intros */}
      {intro.isGroup && (
        <div className="mb-2 flex items-center text-primary">
          <Users size={16} className="mr-1" />
          <span className="text-xs font-medium">Group</span>
        </div>
      )}
      <p className="text-lg mb-2">
        {formatText(firstPart)}
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
