
import React, { useState } from "react";
import { IntroCard } from "./IntroCard";
import { IntroCard as IntroCardType } from "./types";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntroCardsGridProps {
  intros: IntroCardType[];
  onOpenWaitlist: () => void;
}

export const IntroCardsGrid: React.FC<IntroCardsGridProps> = ({ intros, onOpenWaitlist }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();
  
  // Filter and sort intros once
  const visibleIntros = intros
    .filter(intro => intro.visible)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  // For mobile, show cards in a carousel, 1 at a time
  // For tablet and desktop, show all cards in the grid (2x3 or 3x2)
  const itemsPerPage = isMobile ? 1 : visibleIntros.length;
  const totalPages = Math.ceil(visibleIntros.length / itemsPerPage);
  
  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // If we're on tablet or desktop, show all cards in the grid
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

  // For mobile only, show cards in a carousel
  const startIdx = currentPage * itemsPerPage;
  const displayedIntros = visibleIntros.slice(startIdx, startIdx + itemsPerPage);
  
  return (
    <div className="relative z-10">
      <Carousel 
        className="w-full"
        setApi={undefined}
        opts={{
          align: "center",
          loop: true,
        }}
        orientation="horizontal"
      >
        <CarouselContent>
          <CarouselItem className="w-full">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {displayedIntros.map(intro => (
                <IntroCard 
                  key={intro.id}
                  intro={intro}
                  onOpenWaitlist={onOpenWaitlist}
                />
              ))}
            </div>
            
            {/* Navigation controls for mobile */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground" 
                onClick={handlePrevPage}
              >
                <ChevronLeft size={16} className="mr-1" />
                Prev
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({length: totalPages}).map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      currentPage === idx ? 'bg-primary scale-125' : 'bg-muted'
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground" 
                onClick={handleNextPage}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};
