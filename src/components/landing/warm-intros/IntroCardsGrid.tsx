
import React, { useState, useEffect } from "react";
import { IntroCard } from "./IntroCard";
import { IntroCard as IntroCardType } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntroCardsGridProps {
  intros: IntroCardType[];
  onOpenWaitlist: () => void;
}

export const IntroCardsGrid: React.FC<IntroCardsGridProps> = ({ intros, onOpenWaitlist }) => {
  const isMobile = useIsMobile();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  // Filter out only visible intros and sort by position
  const visibleIntros = intros
    .filter(intro => intro.visible)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
    
  useEffect(() => {
    if (!api) {
      return;
    }
 
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
 
    api.on("select", onSelect);
    // Call once to set initial position
    onSelect();
 
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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
  
  // For mobile, we use the carousel layout with arrow navigation
  return (
    <div className="relative z-10">
      <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
          align: "center",
          loop: true
        }}
      >
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
        
        {/* Custom navigation UI with positioned arrow buttons */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          {/* Left arrow button */}
          <Button 
            onClick={() => api?.scrollPrev()} 
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-background border border-border/50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
          
          {/* Dots navigation */}
          <div className="flex justify-center space-x-2">
            {visibleIntros.map((_, index) => (
              <button 
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  current === index ? 'bg-primary scale-125' : 'bg-muted'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Right arrow button */}
          <Button 
            onClick={() => api?.scrollNext()}
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-background border border-border/50 shadow-sm"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </Carousel>
    </div>
  );
};
