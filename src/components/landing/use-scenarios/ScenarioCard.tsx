
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
    <div 
      key={`${scenario.id}-${index}`}
      className="flex flex-col items-center"
    >
      {/* Custom icon with enhanced styling */}
      <div className={cn(
        "transform transition-all duration-300 mb-5 rounded-full shadow-sm",
        isActive ? "scale-125" : "scale-100"
      )}>
        {scenario.icon}
      </div>
      
      <div 
        className={cn(
          "flex-shrink-0 bg-white/80 p-6 rounded-xl shadow-sm transition-all duration-300",
          isActive ? "scale-105 shadow-md" : ""
        )}
        style={{
          width: '300px',
          maxWidth: '350px',
          borderColor: '#e5e7eb', // Consistent gray border color
          height: '130px', // Fixed height for all cards
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Consistent gray shadow
          border: '1px solid #e5e7eb' // Explicit border to prevent any color variations
        }}
      >
        <h3 className="text-lg font-medium tracking-tight leading-relaxed text-gray-800">
          <span className="text-primary text-xl">"</span>
          {scenario.title}
          <span className="text-primary text-xl">"</span>
        </h3>
      </div>
    </div>
  );
};
