
import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { ArrowDown } from "lucide-react";

interface ScenarioItem {
  id: number;
  title: string;
  icon: React.ReactNode;
}

export const RotatingUseScenarios = () => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollSpeed = 0.5; // Controls the speed of scrolling (pixels per frame)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [manualScrolling, setManualScrolling] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Define all use scenarios with icons
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I'm a new grad who just moved to a new city and don't know anyone.",
      icon: <div className="text-6xl">🎓</div>
    },
    {
      id: 2,
      title: "I work remotely and barely see people during the week.",
      icon: <div className="text-6xl">💻</div>
    },
    {
      id: 3,
      title: "I want friendships that aren't random roommates or coworkers.",
      icon: <div className="text-6xl">🤝</div>
    },
    {
      id: 4,
      title: "I'm in college but still feel like I haven't found my people yet.",
      icon: <div className="text-6xl">📚</div>
    },
    {
      id: 5,
      title: "I want deep conversations about books and philosophy over coffee.",
      icon: <div className="text-6xl">☕</div>
    },
    {
      id: 6,
      title: "I'm looking for NBA fans to watch games with.",
      icon: <div className="text-6xl">🏀</div>
    },
    {
      id: 7,
      title: "I've outgrown my circles and want to consciously rebuild my social life.",
      icon: <div className="text-6xl">🔄</div>
    },
    {
      id: 8,
      title: "I have friends but no one I feel deeply connected with.",
      icon: <div className="text-6xl">💭</div>
    },
    {
      id: 9,
      title: "I'm a foodie looking for friends to try restaurants with.",
      icon: <div className="text-6xl">🍽️</div>
    },
  ];
  
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

  // Touch handlers for manual control
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setTouchStartX(e.touches[0].clientX);
    setManualScrolling(true);
    setIsAutoScrolling(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const touchDiff = touchStartX - e.touches[0].clientX;
    
    // Update scroll position directly based on touch movement
    container.scrollLeft += touchDiff;
    setTouchStartX(e.touches[0].clientX);
    
    // Update the active card during manual scrolling
    updateActiveCard();
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setTimeout(() => {
      setManualScrolling(false);
      setIsAutoScrolling(true);
    }, 300); // Small delay before resuming auto-scrolling
  };

  // Add scroll event listener to update active card
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        updateActiveCard();
      };
      
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Start animation when component mounts
  useEffect(() => {
    if (isAutoScrolling && !manualScrolling) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoScrolling, manualScrolling]);

  return (
    <div className="w-full mx-auto">
      {/* Continuously scrolling carousel container with touch support */}
      <div 
        className="relative overflow-hidden w-full px-4"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 pb-16 overflow-x-auto hide-scrollbar" 
          style={{ scrollBehavior: 'auto' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {allScenarios.map((scenario, index) => (
            <div 
              key={`${scenario.id}-${index}`}
              className="flex flex-col items-center"
            >
              {/* Icon now positioned above the card with larger size */}
              <div className={`transform transition-all duration-300 mb-3 ${
                activeCardIndex === index ? 'scale-110' : 'scale-100'
              }`}>
                {scenario.icon}
              </div>
              
              <div 
                className={`flex-shrink-0 bg-white/80 p-6 rounded-xl shadow-sm transition-all duration-300 ${
                  activeCardIndex === index ? 'scale-105 shadow-md' : ''
                }`}
                style={{
                  width: '300px',
                  maxWidth: '350px',
                  borderColor: '#e5e7eb', // Consistent gray border color
                  height: '130px', // Fixed height for all cards
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Consistent gray shadow
                  border: '1px solid #e5e7eb' // Explicit border to prevent any color variations
                }}
              >
                <h3 className="text-lg font-medium tracking-tight leading-relaxed text-gray-800">
                  <span className="text-primary text-xl">"</span>
                  {scenario.title}
                  <span className="text-primary text-xl">"</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Shadow effect for edges to create fading effect */}
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
      
      {/* Scroll indicator - Positioned at the very bottom of the viewport */}
      <div className="flex justify-center fixed bottom-12 left-0 right-0 animate-bounce z-30">
        <ArrowDown className="h-8 w-8 text-primary/70" />
      </div>
    </div>
  );
};
