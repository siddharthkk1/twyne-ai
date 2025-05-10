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
  const scrollSpeed = 0.5;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [manualScrolling, setManualScrolling] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const isMobile = useIsMobile();

  // Clone scenarios 3x for infinite effect
  const allScenarios = [...scenarios, ...scenarios, ...scenarios];

  const updateActiveCard = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    const cards = container.children;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setActiveCardIndex(closestIndex);
  };

  const animate = () => {
    const container = scrollContainerRef.current;
    if (!container || !isAutoScrolling || manualScrolling) return;

    container.scrollLeft += scrollSpeed;

    const scrollLimit = container.scrollWidth / 3;

    if (container.scrollLeft >= scrollLimit * 2) {
      container.scrollLeft = scrollLimit;
    }

    updateActiveCard();

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
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
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;

    container.scrollLeft += diff * 1.5;
    setTouchStartX(currentX);

    updateActiveCard();
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setTimeout(() => {
      setManualScrolling(false);
      setIsAutoScrolling(true);
    }, 1500);
  };

  // Set starting scroll position to center copy
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTo = container.scrollWidth / 3;
      container.scrollLeft = scrollTo;
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => updateActiveCard();

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isAutoScrolling && !manualScrolling) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollSnapType: "x mandatory",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allScenarios.map((scenario, index) => (
          <div
            key={`${scenario.id}-${index}`}
            className="snap-center flex-shrink-0"
            style={{
              scrollSnapAlign: "center",
              width: isMobile ? "80vw" : "350px",
            }}
          >
            <ScenarioCard
              scenario={scenario}
              isActive={activeCardIndex === index}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Gradient edges */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </div>
  );
};
