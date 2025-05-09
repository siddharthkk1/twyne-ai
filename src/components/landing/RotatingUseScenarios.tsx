
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-rotate scenarios
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % scenarios.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [scenarios.length, isAutoScrolling]);
  
  // Scroll active scenario into view when it changes
  useEffect(() => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current;
      const activeElement = scrollContainer.querySelector(`[data-scenario="${activeScenario}"]`);
      
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [activeScenario]);

  // Get random pastel background color for quote
  const getBackgroundColor = (id: number) => {
    const colors = [
      'bg-primary/10',
      'bg-secondary/10',
      'bg-accent/10',
      'bg-primary/5',
      'bg-secondary/5',
      'bg-accent/5',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="py-4 max-w-[900px] mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-center mb-4">
        <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((activeScenario + 1) / scenarios.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
      
      {/* Carousel container */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        <ScrollArea className="w-full">
          <div 
            ref={containerRef}
            className="flex gap-4 pb-4 px-2 snap-x snap-mandatory overflow-x-auto" 
            style={{scrollBehavior: 'smooth'}}
          >
            {scenarios.map((scenario, index) => (
              <div 
                key={scenario.id}
                data-scenario={index}
                className={`flex-shrink-0 snap-center ${getBackgroundColor(scenario.id)} p-6 rounded-xl shadow-sm border border-primary/10 transition-all duration-500 transform ${
                  activeScenario === index 
                    ? 'scale-100 opacity-100' 
                    : 'scale-95 opacity-70'
                }`}
                style={{
                  minWidth: '280px',
                  maxWidth: '320px'
                }}
                onClick={() => setActiveScenario(index)}
              >
                <h3 className="text-xl font-semibold">
                  "<span className="text-primary">{scenario.title}</span>"
                </h3>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Shadow effect for edges */}
        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
