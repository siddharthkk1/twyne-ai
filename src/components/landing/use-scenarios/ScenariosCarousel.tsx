
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const isMobile = useIsMobile();
  const [autoPlay, setAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle auto rotation
  useEffect(() => {
    if (!autoPlay) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }
    
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % scenarios.length);
      
      // Manually scroll the carousel if needed
      if (carouselRef.current) {
        const scrollAmount = carouselRef.current.scrollWidth / scenarios.length;
        carouselRef.current.scrollTo({
          left: (currentIndex + 1) % scenarios.length * scrollAmount,
          behavior: 'smooth'
        });
      }
    }, 5000); // rotate every 5 seconds
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, scenarios.length, currentIndex]);
  
  // Display items include the original scenarios plus duplicates for smooth looping
  const displayItems = [...scenarios, ...scenarios.map((s, i) => ({ ...s, id: s.id + scenarios.length }))];
  
  return (
    <div 
      className="relative w-full overflow-hidden py-4"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
      onTouchStart={() => setAutoPlay(false)}
      onTouchEnd={() => setTimeout(() => setAutoPlay(true), 2000)}
    >
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          skipSnaps: true,
          dragFree: true
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {displayItems.map((scenario, index) => (
            <CarouselItem 
              key={`${scenario.id}-${index}`} 
              className="pl-2 md:pl-4 basis-[350px]"
            >
              <div className="flex flex-col items-center h-full">
                <div className="mb-4 rounded-full p-3 bg-white/90 shadow-sm">
                  {scenario.icon}
                </div>
                <div
                  className="bg-white/90 p-5 rounded-xl shadow-sm border border-gray-100 w-full"
                  style={{
                    minHeight: "140px",
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <h3 className="text-lg font-medium tracking-tight leading-relaxed text-gray-800 text-center">
                    <span className="text-primary text-xl">"</span>
                    {scenario.title}
                    <span className="text-primary text-xl">"</span>
                  </h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center mt-4">
          <div className="flex space-x-2">
            {scenarios.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index ? 'w-4 bg-primary' : 'w-2 bg-muted'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Carousel>

      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
