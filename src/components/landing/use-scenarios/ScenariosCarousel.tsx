
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile, isIOSDevice } from "@/hooks/use-mobile";

// Define the useDeviceDebugInfo hook at the top level
function useDeviceDebugInfo() {
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = React.useState(false);
  
  React.useEffect(() => {
    // Check only once on mount
    setIsIOS(isIOSDevice());
  }, []);
  
  return { 
    isMobile, 
    isIOS, 
    userAgent: window.navigator.userAgent,
    platform: navigator.platform,
    touchPoints: navigator.maxTouchPoints
  };
}

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
  
  // Use useMemo to evaluate isIOS only once per mount
  const isIOS = React.useMemo(() => isIOSDevice(), []);
  const deviceDebugInfo = useDeviceDebugInfo();

  const scrollSpeed = 0.5; // Increased speed (was 0.2, now 0.5 which is 2.5x faster)
  const scenarioWidth = 350;
  const totalWidth = scenarios.length * scenarioWidth;

  // Detect touch devices (non-iOS)
  useEffect(() => {
    if (isIOS) {
      setIsTouchDevice(true);
      console.log("iOS device detected, disabling auto-scroll");
    }
    
    // For non-iOS touch devices
    let touchDetected = false;
    
    const touchHandler = () => {
      touchDetected = true;
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', touchHandler);
      console.log("Touch events detected, treating as touch device");
    };
    
    window.addEventListener('touchstart', touchHandler, { once: true });
    
    // After a timeout, if no touch events detected, assume non-touch device
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
  }, [isIOS]);

  console.log("Carousel state:", {
    totalWidth,
    isMobile,
    isTouchDevice,
    isIOS,
    isPaused: isPaused || isIOS,
    isDragging // Added isDragging to debug info
  });

  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    // Calculate delta time for smoother animation
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Only animate if NOT paused AND NOT on iOS AND NOT a touch device
    if (isPaused || isIOS || isTouchDevice) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Use delta time for smoother animation
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

  // Only start animation if NOT on iOS
  useEffect(() => {
    // Don't even start the animation loop on iOS
    if (isIOS) return;
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, totalWidth, isTouchDevice, isIOS]);

  // Reset the animation when window size changes
  useEffect(() => {
    const handleResize = () => {
      // Don't reset animation on iOS
      if (isIOS) return;
      
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
  }, [isIOS]);

  // Touch handling for manual scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStartTranslate(translateX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Remove e.preventDefault() to allow natural touch scrolling on iOS
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

    // Throttle for smoother motion
    const now = Date.now();
    if (now - lastTouchMove.current < 32) return;
    lastTouchMove.current = now;

    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
    
    // Only prevent default for non-iOS to avoid blocking native scrolling behavior on iOS
    if (!isIOS) {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Only resume animation if not on iOS and not a touch device
    if (!isIOS && !isTouchDevice) {
      setTimeout(() => setIsPaused(false), 2000);
    }
  };

  // Use double scenarios to ensure smooth wrapping
  const displayItems = [...scenarios, ...scenarios.map((s, i) => ({ ...s, id: s.id + scenarios.length }))];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      ref={containerRef}
      onMouseEnter={() => !isIOS && !isTouchDevice && setIsPaused(true)}
      onMouseLeave={() => !isIOS && !isTouchDevice && setIsPaused(false)}
    >
      {/* Debug Info Overlay */}
      <div className="absolute top-0 right-0 z-50 bg-black/70 text-white p-2 text-xs rounded-bl-md font-mono">
        <div>isIOS: {isIOS ? 'true' : 'false'}</div>
        <div>isMobile: {isMobile ? 'true' : 'false'}</div>
        <div>autoScroll: {(!isIOS && !isPaused && !isTouchDevice) ? 'true' : 'false'}</div>
        <div>Platform: {deviceDebugInfo.platform}</div>
        <div>TouchPoints: {deviceDebugInfo.touchPoints}</div>
        <div>isDragging: {isDragging ? 'true' : 'false'}</div>
      </div>

      {isIOS ? (
        // Native horizontal scroll for iOS - much more responsive with native touch handling
        <div className="overflow-x-auto flex gap-4 px-4 pb-4 -mx-4 snap-x snap-mandatory">
          {scenarios.map((scenario, index) => (
            <div
              key={scenario.id}
              className="flex-shrink-0 snap-center"
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
      ) : (
        // Custom translateX animation for non-iOS
        <div
          className={`flex items-center ${isDragging ? 'will-change-transform' : 'transition-all duration-300'} cursor-grab`}
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
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
      )}

      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
