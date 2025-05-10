
import React from "react";
import { scenarios } from "./use-scenarios/ScenarioItem";
import { ScenariosCarousel } from "./use-scenarios/ScenariosCarousel";
import { ScrollIndicator } from "./use-scenarios/ScrollIndicator";

export const RotatingUseScenarios = () => {
  // Debug log to check if component is rendering with scenarios
  console.log("RotatingUseScenarios rendering with", scenarios.length, "scenarios");
  
  return (
    <div className="w-full mx-auto pt-8">
      <div className="mb-6 text-center">
        <h3 className="text-xl md:text-2xl font-medium text-foreground/80">
          Find your people, whatever your situation
        </h3>
      </div>
      
      {/* Sushi carousel component for horizontally scrolling scenarios */}
      <div className="w-full overflow-hidden">
        <ScenariosCarousel scenarios={scenarios} />
      </div>
      
      {/* Scroll indicator arrow */}
      <ScrollIndicator />
    </div>
  );
};
