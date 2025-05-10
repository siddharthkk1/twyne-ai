
import React from "react";
import { scenarios } from "./use-scenarios/ScenarioItem";
import { ScenariosCarousel } from "./use-scenarios/ScenariosCarousel";
import { ScrollIndicator } from "./use-scenarios/ScrollIndicator";

export const RotatingUseScenarios = () => {
  // Debug log to check if component is rendering with scenarios
  console.log("RotatingUseScenarios rendering with", scenarios.length, "scenarios");
  
  return (
    <div className="w-full mx-auto pt-6 mb-12">
      {/* Sushi carousel component for horizontally scrolling scenarios */}
      <div className="w-full overflow-hidden">
        <ScenariosCarousel />
      </div>
      
      {/* Scroll indicator arrow positioned at bottom of hero section */}
      <div className="mt-8">
        <ScrollIndicator />
      </div>
    </div>
  );
};
