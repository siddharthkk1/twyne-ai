
import React, { useEffect, useState } from "react";
import { scenarios } from "./use-scenarios/ScenarioItem";
import { ScenariosCarousel } from "./use-scenarios/ScenariosCarousel";
import { isIOSDevice } from "@/hooks/use-mobile";

export const RotatingUseScenarios = () => {
  const [isIOS, setIsIOS] = useState(false);
  
  // Check iOS on component mount
  useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);
  
  // Debug log to check if component is rendering with scenarios
  console.log("RotatingUseScenarios rendering with", scenarios.length, "scenarios");
  
  return (
    <div className="w-full mx-auto pt-4">
      {/* Sushi carousel component for horizontally scrolling scenarios */}
      <div className="w-full overflow-hidden">
        <ScenariosCarousel scenarios={scenarios} />
      </div>
    </div>
  );
};
