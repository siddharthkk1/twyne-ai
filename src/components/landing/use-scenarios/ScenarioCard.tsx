
import React from "react";
import { cn } from "@/lib/utils";
import type { ScenarioItemProps } from "./ScenarioItem";

interface ScenarioCardProps {
  scenario: ScenarioItemProps;
  isActive: boolean;
  index: number;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  isActive, 
  index 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center transition-all duration-300",
      isActive ? "opacity-100 transform scale-100" : "opacity-70 scale-95"
    )}>
      {/* Custom icon with enhanced styling */}
      <div className={cn(
        "mb-5 rounded-full p-3 bg-white/90 shadow-sm",
        isActive ? "scale-110" : "scale-100"
      )}>
        {scenario.icon}
      </div>
      
      <div 
        className={cn(
          "bg-white/90 p-6 rounded-xl shadow-sm transition-all duration-300 border border-gray-100",
          isActive ? "shadow-md" : ""
        )}
        style={{
          width: '300px',
          maxWidth: '90vw',
          minHeight: '130px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <h3 className="text-lg font-medium tracking-tight leading-relaxed text-gray-800 text-center">
          <span className="text-primary text-xl">"</span>
          {scenario.title}
          <span className="text-primary text-xl">"</span>
        </h3>
      </div>
    </div>
  );
};
