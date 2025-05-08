
import React, { useState, useEffect } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  
  // Define all use scenarios - removed descriptions
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I just moved to a new city and don't know anyone.",
    },
    {
      id: 2,
      title: "I have friends, but none I feel deeply connected to.",
    },
    {
      id: 3,
      title: "I'm in a big transition and want new people who match where I'm at now.",
    },
    {
      id: 4,
      title: "I'm tired of flaky group chats and surface-level hangs.",
    },
    {
      id: 5,
      title: "I'm socially burnt out but still crave meaningful 1:1 interaction.",
    },
    {
      id: 6,
      title: "I've outgrown my old circles and want to rebuild my social life consciously.",
    },
    {
      id: 7,
      title: "I'm introverted and hate swiping or forced mingling, but I do want to meet people.",
    },
    {
      id: 8,
      title: "I want to meet more people like me—bookworms, creatives, gym rats, third culture kids.",
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
    <div className="min-h-[100px] flex flex-col items-center text-center max-w-[800px] mx-auto">
      <div className="mb-2 min-h-[50px] flex items-center">
        <h3 className="text-xl md:text-2xl font-bold">
          "<span className="text-primary animate-fade-in">{currentScenario.title}</span>"
        </h3>
      </div>
      
      <div className="flex justify-center gap-2">
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
