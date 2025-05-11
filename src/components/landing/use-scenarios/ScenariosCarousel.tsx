
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Increase scrollSpeed by 25%, from 0.5 to 0.625
  const scrollSpeed = 0.625; // pixels per frame at 60fps (25% increase from 0.5)
  
  // Calculate the total width properly (full width of all original scenarios)
  const scenarioWidth = 350; // Each card is about 350px (width + margins)
  const totalWidth = scenarios.length * scenarioWidth;

  // Animation function for constant movement
  const animate = () => {
    if (isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    setTranslateX(prev => {
      // Reset position when all cards have scrolled by
      const newPosition = prev - scrollSpeed;
      
      // When we've scrolled past all scenarios, reset to beginning
      // We don't want to use Math.abs here because we need to track direction
      if (newPosition <= -totalWidth) {
        return 0;
      }
      return newPosition;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation on mount
  useEffect(() => {
    console.log("Starting sushi carousel animation with totalWidth:", totalWidth);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, totalWidth]);

  // Handle manual interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStartTranslate(translateX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragStartTranslate(translateX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Resume animation after a short pause
    setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  // Ensure we have enough cards to create an infinite effect
  // Fix the duplicate scenarios to ensure they all have unique keys
  const displayItems = [...scenarios, ...scenarios.map((scenario, index) => ({
    ...scenario,
    id: scenario.id + scenarios.length // Ensure unique IDs for the duplicated items
  }))];

  return (
    <div 
      className="relative w-full overflow-hidden py-4"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="flex items-center transition-transform cursor-grab"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s linear',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        onMouseLeave={isDragging ? handleDragEnd : undefined}
      >
        {displayItems.map((scenario, index) => (
          <div
            key={`${scenario.id}-${index}`}
            className="flex-shrink-0 px-4"
            style={{ width: `${scenarioWidth}px` }}
          >
            <div className="flex flex-col items-center h-full">
              {/* Icon above the card */}
              <div className="mb-4 rounded-full p-3 bg-white/90 shadow-sm">
                {scenario.icon}
              </div>
              
              {/* Fixed height card */}
              <div 
                className="bg-white/90 p-5 rounded-xl shadow-sm transition-all duration-300 border border-gray-100 w-full"
                style={{
                  minHeight: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <h3 className="text-lg font-medium tracking-tight leading-relaxed text-gray-800 text-center">
                  <span className="text-primary text-xl">"</span>
                  {scenario.title}
                  <span className="text-primary text-xl">"</span>
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Shadow effect for edges to create fading effect */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </div>
  );
};
