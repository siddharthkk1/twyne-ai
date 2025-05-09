
import React, { useState, useEffect } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  
  // Define all use scenarios - restored to original longer phrases
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
    <div className="min-h-[70px] flex flex-col items-center text-center max-w-[900px] mx-auto">
      <div className="mb-1 min-h-[50px] flex items-center w-full">
        <h3 className="text-xl md:text-2xl font-bold w-full whitespace-normal">
          "<span className="text-primary animate-fade-in">{currentScenario.title}</span>"
        </h3>
      </div>
      
      <div className="flex justify-center gap-2 mt-1 mb-0">
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
