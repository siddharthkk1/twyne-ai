
import React from "react";
import { scenarios } from "./use-scenarios/ScenarioItem";
import { ScenariosCarousel } from "./use-scenarios/ScenariosCarousel";
import { ScrollIndicator } from "./use-scenarios/ScrollIndicator";

export const RotatingUseScenarios = () => {
  // Debug log to check if component is rendering with scenarios
  console.log("RotatingUseScenarios rendering with", scenarios.length, "scenarios");
  
  return (
    <div className="w-full mx-auto pt-8">
      {/* Carousel component for rotating scenarios */}
      <ScenariosCarousel scenarios={scenarios} />
      
      {/* Scroll indicator arrow */}
      <ScrollIndicator />
    </div>
  );
};
