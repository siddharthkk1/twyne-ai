
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IntroCardsGrid } from "./IntroCardsGrid";
import { initialIntros, additionalIntros } from "./intros-data";
import { IntroCard } from "./types";

interface WarmIntrosSectionProps {
  onOpenWaitlist: () => void;
}

export const WarmIntrosSection = ({ onOpenWaitlist }: WarmIntrosSectionProps) => {
  // Initialize with all cards visible
  const [intros, setIntros] = useState<IntroCard[]>(() => {
    return [...initialIntros, ...additionalIntros].map((card, index) => ({
      ...card,
      visible: true,
      position: index
    }));
  });
  
  const isMobile = useIsMobile();
  
  // No animation or card rotation on mobile
  useEffect(() => {
    if (!isMobile) {
      // Only implement card rotation for non-mobile
      const rotateOneCard = () => {
        setIntros(currentIntros => {
          // Get visible and hidden intros
          const visibleIntros = currentIntros.filter(intro => intro.visible);
          const hiddenIntros = currentIntros.filter(intro => !intro.visible);
          
          // If no hidden intros available, don't change anything
          if (hiddenIntros.length === 0) return currentIntros;
          
          // Pick one random visible card to hide
          const randomVisibleIndex = Math.floor(Math.random() * visibleIntros.length);
          const cardToHide = visibleIntros[randomVisibleIndex];
          
          // Get the position of the card being hidden
          const positionToReplace = cardToHide.position;
          
          // Get the first hidden card
          const cardToShow = hiddenIntros[0];
          
          // Create a new array with the updated visibility states and position
          return currentIntros.map(card => {
            if (card.id === cardToHide.id) return { ...card, visible: false };
            if (card.id === cardToShow.id) return { ...card, visible: true, position: positionToReplace };
            return card; // Keep all other cards unchanged
          });
        });
      };
      
      // Set interval to rotate one card every 5 seconds (desktop only)
      const interval = setInterval(rotateOneCard, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile]);
  
  return (
    <section className="py-16 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="rounded-full bg-secondary/20 p-3 inline-flex mb-4">
            <Sparkles className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold">How We Introduce People</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates warm, personalized introductions based on genuine commonalities
          </p>
        </div>
        
        <IntroCardsGrid 
          intros={intros}
          onOpenWaitlist={onOpenWaitlist}
        />
      </div>
    </section>
  );
};
