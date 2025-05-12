
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile, isIOSDevice } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const lastTouchMove = useRef<number>(0);

  const scrollSpeed = 0.5; // Slightly reduced speed for smoother animation
  const scenarioWidth = 350;
  const totalWidth = scenarios.length * scenarioWidth;

  // Better iOS and touch device detection
  useEffect(() => {
    // First check for iOS specifically
    const isIOS = isIOSDevice();
    
    if (isIOS) {
      setIsTouchDevice(true);
      console.log("iOS device detected via useragent & touch events");
      return;
    }
    
    // For non-iOS devices, detect touch capability
    let touchDetected = false;
    
    const touchHandler = () => {
      touchDetected = true;
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', touchHandler);
      console.log("Touch events detected, treating as touch device");
    };
    
    window.addEventListener('touchstart', touchHandler, { once: true });
    
    // After a short timeout, if no touch events have been detected,
    // assume it's not a touch device
    const timeoutId = setTimeout(() => {
      if (!touchDetected) {
        setIsTouchDevice(false);
        console.log("No touch events detected, treating as non-touch device");
      }
      window.removeEventListener('touchstart', touchHandler);
    }, 1000);
    
    return () => {
      window.removeEventListener('touchstart', touchHandler);
      clearTimeout(timeoutId);
    };
  }, []);

  console.log("Starting carousel with totalWidth:", totalWidth, "isMobile:", isMobile, "isTouchDevice:", isTouchDevice);

  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    // Calculate delta time for smoother animation
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Don't animate when paused or on touch devices
    if (isPaused || isTouchDevice) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Use delta time to create smoother animation
    const pixelsPerFrame = (scrollSpeed * deltaTime) / 16.67; // Normalize to 60fps

    setTranslateX((prev) => {
      const newPosition = prev - pixelsPerFrame;
      
      // Ensure smooth looping
      if (newPosition <= -totalWidth) {
        return 0;
      }
      return newPosition;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, totalWidth, isTouchDevice]);

  // Reset the animation when window size changes
  useEffect(() => {
    const handleResize = () => {
      // Stop existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Reset state
      setTranslateX(0);
      lastTimeRef.current = 0;

      // Restart animation
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    // Throttle touch events for better performance on mobile
    const now = Date.now();
    if (now - lastTouchMove.current < 16) return; // ~60fps throttle
    lastTouchMove.current = now;

    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
    
    // Prevent default to stop page scrolling while dragging
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Only resume animation if not on a touch device
    if (!isTouchDevice) {
      setTimeout(() => setIsPaused(false), 2000);
    }
  };

  const displayItems = [...scenarios, ...scenarios.map((s, i) => ({ ...s, id: s.id + scenarios.length }))];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      ref={containerRef}
      onMouseEnter={() => !isTouchDevice && setIsPaused(true)}
      onMouseLeave={() => !isTouchDevice && setIsPaused(false)}
    >
      <div
        className={`flex items-center ${isDragging ? '' : 'transition-transform'} cursor-grab will-change-transform`}
        style={{
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isDragging ? "none" : "transform 0.1s linear",
          WebkitBackfaceVisibility: "hidden", // Hardware acceleration for iOS
          WebkitPerspective: 1000,
          WebkitTransform: `translate3d(${translateX}px, 0, 0)`,
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
