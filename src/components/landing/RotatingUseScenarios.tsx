
import React, { useState, useEffect } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  
  // Define all use scenarios - updated with more specific scenarios
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I just moved to a new city and don't know anyone.",
    },
    {
      id: 2,
      title: "I love climbing and want buddies who'll join me at the gym once a week.",
    },
    {
      id: 3,
      title: "My career is niche and I want to meet people who actually get what I do.",
    },
    {
      id: 4,
      title: "I want deep conversations about books and philosophy over coffee.",
    },
    {
      id: 5,
      title: "I'm looking for NBA fans in the city to watch games with.",
    },
    {
      id: 6,
      title: "I've outgrown my old circles and want to rebuild my social life consciously.",
    },
    {
      id: 7,
      title: "I have friends but no one I feel deeply connected with.",
    },
    {
      id: 8,
      title: "I'm a foodie looking for friends to try new restaurants with.",
    },
  ];

  useEffect(() => {
    // Change rotation timer to 5 seconds
    const rotationTimer = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % scenarios.length);
    }, 5000);
    
    // Clean up timer on unmount
    return () => clearInterval(rotationTimer);
  }, [scenarios.length]);

  const currentScenario = scenarios[activeScenario];

  return (
    <div className="min-h-[60px] flex flex-col items-center text-center max-w-[800px] mx-auto">
      <div className="mb-2 min-h-[40px] flex items-center">
        <h3 className="text-xl md:text-2xl font-bold">
          "<span className="text-primary animate-fade-in">{currentScenario.title}</span>"
        </h3>
      </div>
      
      <div className="flex justify-center gap-2 mt-0"> {/* Further reduced vertical spacing */}
        {scenarios.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeScenario ? "bg-primary scale-125" : "bg-muted-foreground/30"
            }`}
            onClick={() => setActiveScenario(index)}
            aria-label={`Go to scenario ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
