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
  const lastTouchMove = useRef<number>(0);

  const scrollSpeed = 0.625;
  const scenarioWidth = 350;
  const totalWidth = scenarios.length * scenarioWidth;

  const animate = () => {
    if (isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    setTranslateX((prev) => {
      const newPosition = prev - scrollSpeed;
      return newPosition <= -totalWidth ? 0 : newPosition;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, totalWidth]);

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

    const now = Date.now();
    if (now - lastTouchMove.current < 16) return; // ~60fps throttle
    lastTouchMove.current = now;

    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const displayItems = [...scenarios, ...scenarios.map((s, i) => ({ ...s, id: s.id + scenarios.length }))];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex items-center transition-transform cursor-grab will-change-transform"
        style={{
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isDragging ? "none" : "transform 0.1s linear",
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
          </div>
        ))}
      </div>

      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
