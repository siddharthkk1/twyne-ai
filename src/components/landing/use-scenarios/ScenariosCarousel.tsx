
import React, { useState, useEffect, useRef } from "react";
import { ScenarioCard } from "./ScenarioCard";
import type { ScenarioItemProps } from "./ScenarioItem";
import { useIsMobile, isIOSDevice, useDeviceDebugInfo } from "@/hooks/use-mobile";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const lastTouchMove = useRef<number>(0);
  const deviceDebugInfo = useDeviceDebugInfo();
  const [isIOS, setIsIOS] = useState(false);

  const scenarioWidth = 350;
  const totalWidth = scenarios.length * scenarioWidth;

  // Improved iOS and touch device detection
  useEffect(() => {
    // First check for iOS specifically using our enhanced detection
    const iosDetected = isIOSDevice();
    setIsIOS(iosDetected);
    
    if (iosDetected) {
      setIsTouchDevice(true);
      console.log("iOS device detected, disabling auto-scroll");
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
  }, []);

  console.log("Starting carousel with totalWidth:", totalWidth, "isMobile:", isMobile, "isTouchDevice:", isTouchDevice, "isIOS:", isIOS);

  // Enhanced touch handling for smoother scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStartTranslate(translateX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
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

    // More aggressive throttling for touch devices to reduce jitter
    const now = Date.now();
    if (now - lastTouchMove.current < 32) return; // Throttle to ~30fps for smoother motion
    lastTouchMove.current = now;

    const deltaX = e.touches[0].clientX - startX;
    setTranslateX(dragStartTranslate + deltaX);
    
    // Prevent default to avoid iOS bouncing/scrolling
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const displayItems = [...scenarios, ...scenarios.map((s, i) => ({ ...s, id: s.id + scenarios.length }))];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      ref={containerRef}
    >
      {/* Debug Info Overlay */}
      <div className="absolute top-0 right-0 z-50 bg-black/70 text-white p-2 text-xs rounded-bl-md font-mono">
        <div>isIOS: {isIOS ? 'true' : 'false'}</div>
        <div>isMobile: {deviceDebugInfo.isMobile ? 'true' : 'false'}</div>
        <div>isTouchDevice: {isTouchDevice ? 'true' : 'false'}</div>
        <div>Platform: {deviceDebugInfo.platform}</div>
        <div>TouchPoints: {deviceDebugInfo.touchPoints}</div>
        <div className="max-w-[300px] truncate">UA: {deviceDebugInfo.userAgent}</div>
      </div>

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

      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
