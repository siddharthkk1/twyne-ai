
import React from "react";
import { IntroCard } from "./IntroCard";
import { IntroCard as IntroCardType } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface IntroCardsGridProps {
  intros: IntroCardType[];
  onOpenWaitlist: () => void;
}

export const IntroCardsGrid: React.FC<IntroCardsGridProps> = ({ intros, onOpenWaitlist }) => {
  const isMobile = useIsMobile();
  
  // Filter out only visible intros and sort by position
  const visibleIntros = intros
    .filter(intro => intro.visible)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // For desktop, we use the grid layout
  if (!isMobile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
        {visibleIntros.map(intro => (
          <IntroCard 
            key={intro.id}
            intro={intro}
            onOpenWaitlist={onOpenWaitlist}
          />
        ))}
      </div>
    );
  }
  
  // For mobile, we use the carousel layout
  return (
    <div className="relative z-10">
      <Carousel className="w-full">
        <CarouselContent>
          {visibleIntros.map(intro => (
            <CarouselItem key={intro.id} className="flex justify-center">
              <IntroCard 
                intro={intro}
                onOpenWaitlist={onOpenWaitlist}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-2 lg:-left-4 bg-background border border-border/50 shadow-sm" />
        <CarouselNext className="-right-2 lg:-right-4 bg-background border border-border/50 shadow-sm" />
      </Carousel>
      
      {/* Dots navigation */}
      <div className="flex justify-center mt-4 space-x-2">
        {visibleIntros.map((_, index) => (
          <div 
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === 0 ? 'bg-primary scale-125' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
