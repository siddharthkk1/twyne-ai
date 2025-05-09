
import React, { useState, useEffect, useRef } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollSpeed = 0.5; // Controls the speed of scrolling (pixels per frame)
  
  // Define all use scenarios
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I'm a new grad who just moved to a new city and don't know anyone.",
    },
    {
      id: 2,
      title: "I work remotely and barely see people during the week.",
    },
    {
      id: 3,
      title: "I want friendships that aren't random roommates or coworkers.",
    },
    {
      id: 4,
      title: "I'm in college but still feel like I haven't found my people yet.",
    },
    {
      id: 5,
      title: "I want deep conversations about books and philosophy over coffee.",
    },
    {
      id: 6,
      title: "I'm looking for NBA fans to watch games with.",
    },
    {
      id: 7,
      title: "I've outgrown my circles and want to consciously rebuild my social life.",
    },
    {
      id: 8,
      title: "I have friends but no one I feel deeply connected with.",
    },
    {
      id: 9,
      title: "I'm a foodie looking for friends to try restaurants with.",
    },
  ];
  
  // Clone scenarios multiple times for seamless infinite scrolling effect
  const allScenarios = [...scenarios, ...scenarios, ...scenarios];

  // Continuous smooth scrolling animation
  const animate = () => {
    if (!scrollContainerRef.current || !isAutoScrolling) return;
    
    const container = scrollContainerRef.current;
    
    // Move by scrollSpeed pixels each frame
    container.scrollLeft += scrollSpeed;
    
    // If we've scrolled past the first set of items, reset to create infinite loop effect
    if (container.scrollLeft >= (container.scrollWidth / 3)) {
      container.scrollLeft = 1; // Reset to beginning (not 0 to avoid flicker)
    }
    
    // Find the active scenario based on scroll position
    const scenarioWidth = container.scrollWidth / allScenarios.length;
    const newActiveScenario = Math.floor((container.scrollLeft / scenarioWidth) % scenarios.length);
    
    if (newActiveScenario !== activeScenario) {
      setActiveScenario(newActiveScenario);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation when component mounts
  useEffect(() => {
    if (isAutoScrolling) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoScrolling]);

  // Get background color for quote cards
  const getBackgroundColor = (id: number) => {
    const colors = [
      'bg-white/80',
      'bg-primary/5',
      'bg-secondary/5',
      'bg-accent/5',
      'bg-white/70',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="py-12 max-w-[1000px] mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="h-1 w-40 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((activeScenario + 1) / scenarios.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
      
      {/* Continuously scrolling carousel container */}
      <div 
        className="relative overflow-hidden mx-4"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 pb-8 overflow-x-auto hide-scrollbar" 
          style={{ scrollBehavior: 'auto' }}
        >
          {allScenarios.map((scenario, index) => (
            <div 
              key={`${scenario.id}-${index}`}
              className={`flex-shrink-0 ${getBackgroundColor(scenario.id)} p-6 rounded-xl shadow-sm border border-primary/10 transition-all duration-300`}
              style={{
                minWidth: '300px',
                maxWidth: '350px'
              }}
            >
              <h3 className="text-lg font-medium tracking-tight leading-relaxed">
                <span className="text-primary font-serif italic text-xl">"</span>
                <span className="text-gray-800 font-serif">{scenario.title}</span>
                <span className="text-primary font-serif italic text-xl">"</span>
              </h3>
            </div>
          ))}
        </div>
        
        {/* Shadow effect for edges to create fading effect */}
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
