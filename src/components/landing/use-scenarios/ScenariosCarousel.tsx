
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
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
    if (isAutoScrolling) {
      autoScrollRef.current = setInterval(() => {
        goToNextSlide();
      }, 3000); // Change slide every 3 seconds
    }
    
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, scenarios.length]);

  // Debug log to check if component is rendering with proper data
  useEffect(() => {
    console.log("ScenariosCarousel rendering with", scenarios.length, "scenarios", 
      "Active slide:", activeSlide);
  }, [scenarios, activeSlide]);

  return (
    <div 
      className="relative w-full px-4 min-h-[400px] flex items-center justify-center"
      onMouseEnter={() => setIsAutoScrolling(false)}
      onMouseLeave={() => setIsAutoScrolling(true)}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-full overflow-hidden"
          style={{ maxWidth: '1200px' }}  
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeSlide * 100 / scenarios.length}%)`,
              width: `${scenarios.length * 100}%`
            }}
          >
            {scenarios.map((scenario, index) => (
              <div
                key={`${scenario.id}-${index}`}
                className="flex-shrink-0"
                style={{ width: `${100 / scenarios.length}%` }}
              >
                <div className="flex justify-center items-center py-8">
                  <ScenarioCard
                    scenario={scenario}
                    isActive={activeSlide === index}
                    index={index}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
        {scenarios.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              activeSlide === index ? 'bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Shadow effect for edges to create fading effect */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </div>
  );
};
