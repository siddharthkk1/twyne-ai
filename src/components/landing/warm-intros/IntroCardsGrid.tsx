
import React, { useState } from "react";
import { IntroCard } from "./IntroCard";
import { IntroCard as IntroCardType } from "./types";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
  const [api, setApi] = useState<any>(null);
  
  // Filter and sort intros once
  const visibleIntros = intros
    .filter(intro => intro.visible)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  // For mobile, show cards in a carousel, 1 at a time
  // For tablet and desktop, show all cards in the grid (2x3 or 3x2)
  const itemsPerPage = isMobile ? 1 : visibleIntros.length;
  const totalPages = Math.ceil(visibleIntros.length / itemsPerPage);
  
  const handleNextPage = () => {
    if (api) {
      api.scrollNext();
    }
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    if (api) {
      api.scrollPrev();
    }
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Update current page when carousel changes
  React.useEffect(() => {
    if (!api || !isMobile) return;
    
    const onSelect = () => {
      setCurrentPage(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, isMobile]);

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
  return (
    <div className="relative z-10">
      <Carousel 
        className="w-full"
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        orientation="horizontal"
      >
        <CarouselContent>
          {visibleIntros.map((intro, index) => (
            <CarouselItem key={intro.id} className="w-full">
              <IntroCard 
                intro={intro}
                onOpenWaitlist={onOpenWaitlist}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Custom navigation controls for mobile */}
      <div className="flex items-center justify-between mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full" 
          onClick={handlePrevPage}
          disabled={currentPage === 0 && !api?.canScrollPrev()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous intro</span>
        </Button>
      
        <div className="flex justify-center space-x-2">
          {Array.from({length: totalPages}).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setCurrentPage(idx);
                if (api) api.scrollTo(idx);
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                currentPage === idx ? 'bg-primary scale-125' : 'bg-muted'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full" 
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1 && !api?.canScrollNext()}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next intro</span>
        </Button>
      </div>
    </div>
  );
};
