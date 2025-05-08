
import React, { useState, useEffect } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  
  // Define all use scenarios - updated for more variety
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I just moved to a new city and don't know anyone.",
    },
    {
      id: 2,
      title: "I want to expand my friend circle with people who share similar hobbies.",
    },
    {
      id: 3,
      title: "I'm looking for workout buddies who can keep me accountable.",
    },
    {
      id: 4,
      title: "I'm tired of flaky group chats and surface-level hangs.",
    },
    {
      id: 5,
      title: "I want to meet people from different backgrounds to broaden my perspectives.",
    },
    {
      id: 6,
      title: "I've outgrown my old circles and want to rebuild my social life consciously.",
    },
    {
      id: 7,
      title: "I work remotely and miss casual office friendships.",
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
    <div className="min-h-[80px] flex flex-col items-center text-center max-w-[800px] mx-auto">
      <div className="mb-3 min-h-[40px] flex items-center">
        <h3 className="text-xl md:text-2xl font-bold">
          "<span className="text-primary animate-fade-in">{currentScenario.title}</span>"
        </h3>
      </div>
      
      <div className="flex justify-center gap-2 mb-6 mt-4"> {/* Increased vertical spacing */}
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
