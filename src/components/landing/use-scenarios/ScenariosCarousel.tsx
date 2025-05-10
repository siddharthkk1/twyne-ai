
import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollSpeed = 0.5; // Controls the speed of scrolling (pixels per frame)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [manualScrolling, setManualScrolling] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const isMobile = useIsMobile();
  
  // Clone scenarios multiple times for seamless infinite scrolling effect
  const allScenarios = [...scenarios, ...scenarios, ...scenarios];

  // Function to determine which card is in the center of view
  const updateActiveCard = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerCenter = container.offsetLeft + container.offsetWidth / 2;
    const cards = container.children;
    
    // Find the card that's closest to the center
    let closestCardIndex = 0;
    let minDistance = Infinity;
    
    // Loop through all cards to find the one closest to center
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestCardIndex = i;
      }
    }
    
    setActiveCardIndex(closestCardIndex);
  };

  // Continuous smooth scrolling animation
  const animate = () => {
    if (!scrollContainerRef.current || !isAutoScrolling || manualScrolling) return;
    
    const container = scrollContainerRef.current;
    
    // Move by scrollSpeed pixels each frame
    container.scrollLeft += scrollSpeed;
    
    // If we've scrolled past the first set of items, reset to create infinite loop effect
    if (container.scrollLeft >= (container.scrollWidth / 3)) {
      container.scrollLeft = 1; // Reset to beginning (not 0 to avoid flicker)
    }
    
    // Update which card is in the center
    updateActiveCard();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Improved touch handlers for better mobile experience
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    
    // Immediately stop auto-scrolling and animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setTouchStartX(e.touches[0].clientX);
    setManualScrolling(true);
    setIsAutoScrolling(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const touchCurrentX = e.touches[0].clientX;
    const touchDiff = touchStartX - touchCurrentX;
    
    // Update scroll position directly based on touch movement
    container.scrollLeft += touchDiff * 1.5; // Multiply for more responsive feeling
    setTouchStartX(touchCurrentX);
    
    // Update the active card during manual scrolling
    updateActiveCard();
    
    // Prevent default to avoid page scrolling while swiping the carousel
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    
    // Add a delay before resuming auto-scrolling
    setTimeout(() => {
      setManualScrolling(false);
      setIsAutoScrolling(true);
    }, 1500); // Longer delay before resuming auto-scrolling
  };

  // Add scroll event listener to update active card
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        updateActiveCard();
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Start/stop animation based on state
  useEffect(() => {
    if (isAutoScrolling && !manualScrolling) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoScrolling, manualScrolling]);

  return (
    <div 
      className="relative overflow-hidden w-full px-4"
      onMouseEnter={() => setIsAutoScrolling(false)}
      onMouseLeave={() => setIsAutoScrolling(true)}
    >
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 pb-16 overflow-x-auto hide-scrollbar touch-pan-x snap-x snap-mandatory" 
        style={{ 
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollSnapType: 'x mandatory'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allScenarios.map((scenario, index) => (
          <div 
            key={`${scenario.id}-${index}`}
            className="snap-center"
            style={{ scrollSnapAlign: 'center' }}
          >
            <ScenarioCard
              scenario={scenario}
              isActive={activeCardIndex === index}
              index={index}
            />
          </div>
        ))}
      </div>
      
      {/* Shadow effect for edges to create fading effect */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </div>
  );
};
