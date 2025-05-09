
import React, { useState, useEffect } from "react";

interface ScenarioItem {
  id: number;
  title: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  useEffect(() => {
    // Set animating state to trigger transition effect
    const changeScenario = () => {
      setIsAnimating(true);
      
      // After animation out completes, change the scenario
      setTimeout(() => {
        setActiveScenario((prev) => (prev + 1) % scenarios.length);
        
        // Then animate back in
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 500);
    };
    
    const rotationTimer = setInterval(changeScenario, 5000);
    
    // Clean up timer on unmount
    return () => clearInterval(rotationTimer);
  }, [scenarios.length]);

  const currentScenario = scenarios[activeScenario];
  const nextScenario = scenarios[(activeScenario + 1) % scenarios.length];

  return (
    <div className="min-h-[100px] flex flex-col items-center text-center max-w-[900px] mx-auto py-2 overflow-hidden">
      <div className="relative w-full min-h-[80px] flex items-center justify-center overflow-hidden">
        {/* Current quote with slide animation */}
        <h3 
          className={`text-xl md:text-2xl font-bold w-full absolute transition-all duration-500 ease-in-out ${
            isAnimating 
              ? 'opacity-0 transform translate-x-[-100%]' 
              : 'opacity-100 transform translate-x-0'
          }`}
        >
          "<span className="text-primary">{currentScenario.title}</span>"
        </h3>
        
        {/* Next quote waiting to slide in */}
        <h3 
          className={`text-xl md:text-2xl font-bold w-full absolute transition-all duration-500 ease-in-out ${
            isAnimating 
              ? 'opacity-100 transform translate-x-0' 
              : 'opacity-0 transform translate-x-[100%]'
          }`}
        >
          "<span className="text-primary">{nextScenario.title}</span>"
        </h3>
      </div>
      
      {/* Visual indicator that this is a carousel */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-1 w-16 rounded-full bg-primary/30 overflow-hidden">
          <div 
            className="h-full bg-primary animate-[pulse_5s_ease-in-out_infinite]" 
            style={{
              width: `${(activeScenario / (scenarios.length - 1)) * 100}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
