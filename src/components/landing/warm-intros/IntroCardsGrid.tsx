
import React from "react";
import { IntroCard } from "./IntroCard";
import { IntroCard as IntroCardType } from "./types";

interface IntroCardsGridProps {
  intros: IntroCardType[];
  onOpenWaitlist: () => void;
}

export const IntroCardsGrid: React.FC<IntroCardsGridProps> = ({ intros, onOpenWaitlist }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
      {/* Sort by position before rendering to maintain position in the grid */}
      {intros
        .filter(intro => intro.visible)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(intro => (
          <IntroCard 
            key={intro.id}
            intro={intro}
            onOpenWaitlist={onOpenWaitlist}
          />
        ))}
    </div>
  );
};
