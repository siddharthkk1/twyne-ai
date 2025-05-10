
import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [manualScrolling, setManualScrolling] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Function to go to next slide with wraparound
  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % scenarios.length);
  };

  // Function to go to previous slide with wraparound
  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + scenarios.length) % scenarios.length);
  };

  // Set up automatic sliding
  useEffect(() => {
    if (isAutoScrolling && !manualScrolling) {
      autoScrollRef.current = setInterval(() => {
        goToNextSlide();
      }, 3000); // Change slide every 3 seconds
    }
    
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, manualScrolling, scenarios.length]);

  // Handle touch start
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setManualScrolling(true);
    setIsAutoScrolling(false);
    
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchStartX - touchCurrentX;
    
    // Threshold for slide change (20% of screen width)
    if (Math.abs(diff) > window.innerWidth * 0.2) {
      if (diff > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
      setTouchStartX(null);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setTouchStartX(null);
    
    // Resume auto-scrolling after a delay
    setTimeout(() => {
      setManualScrolling(false);
      setIsAutoScrolling(true);
    }, 1500);
  };

  return (
    <div 
      className="relative overflow-hidden w-full px-4"
      onMouseEnter={() => setIsAutoScrolling(false)}
      onMouseLeave={() => setIsAutoScrolling(true)}
    >
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out will-change-transform"
          style={{
            transform: `translateX(-${activeSlide * 100}%)`,
            width: `${scenarios.length * 100}%`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {scenarios.map((scenario, index) => (
            <div
              key={`${scenario.id}-${index}`}
              className="w-full flex-shrink-0 flex justify-center items-center"
            >
              <ScenarioCard
                scenario={scenario}
                isActive={activeSlide === index}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Shadow effect for edges to create fading effect */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </div>
  );
};
