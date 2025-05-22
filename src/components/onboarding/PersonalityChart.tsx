
import React from "react";

export interface PersonalityTraits {
  extroversion: number;
  openness: number;
  empathy: number;
  structure: number;
}

export interface PersonalityChartProps {
  traits: PersonalityTraits;
}

export const PersonalityChart: React.FC<PersonalityChartProps> = ({ traits }) => {
  const { extroversion, openness, empathy, structure } = traits;
  
  // Calculate positions for each trait on a pentagon
  const calculatePosition = (value: number, index: number, total: number) => {
    // Scale value from 0-100 to 0-1, but minimum of 0.1 for visibility
    const scaledValue = Math.max(0.1, value / 100);
    
    // Calculate angle based on position around the chart (in radians)
    const angle = (Math.PI * 2 * index) / total;
    
    // Center point of the chart
    const centerX = 100;
    const centerY = 100;
    
    // Calculate position using polar coordinates
    const x = centerX + scaledValue * 80 * Math.sin(angle);
    const y = centerY - scaledValue * 80 * Math.cos(angle);
    
    return { x, y };
  };
  
  // Create trait array and get positions
  const traitArray = [
    { name: 'Extroversion', value: extroversion },
    { name: 'Openness', value: openness },
    { name: 'Empathy', value: empathy },
    { name: 'Structure', value: structure }
  ];
  
  const traitPositions = traitArray.map((trait, index) => ({
    ...trait,
    ...calculatePosition(trait.value, index, traitArray.length)
  }));

  // Create the polygon points for the chart area
  const polygonPoints = traitPositions.map(p => `${p.x},${p.y}`).join(' ');
  
  // Create axis lines from center to each trait position
  const centerX = 100;
  const centerY = 100;
  const axisLines = traitArray.map((_, index) => {
    const angle = (Math.PI * 2 * index) / traitArray.length;
    const x = centerX + 80 * Math.sin(angle);
    const y = centerY - 80 * Math.cos(angle);
    return { x1: centerX, y1: centerY, x2: x, y2: y };
  });

  return (
    <div className="w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto">
        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r="80" fill="none" stroke="#f0f0f0" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r="60" fill="none" stroke="#f0f0f0" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r="40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r="20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
        
        {/* Axis lines */}
        {axisLines.map((line, index) => (
          <line 
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        ))}
        
        {/* Trait polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(155, 135, 245, 0.3)"
          stroke="#9b87f5"
          strokeWidth="2"
        />
        
        {/* Trait points */}
        {traitPositions.map((trait, index) => (
          <circle
            key={index}
            cx={trait.x}
            cy={trait.y}
            r="4"
            fill="#9b87f5"
          />
        ))}
        
        {/* Trait labels */}
        {traitPositions.map((trait, index) => {
          // Calculate position for the label slightly beyond the data point
          const angle = (Math.PI * 2 * index) / traitArray.length;
          const labelDistance = 85;
          const labelX = centerX + labelDistance * Math.sin(angle);
          const labelY = centerY - labelDistance * Math.cos(angle);
          
          return (
            <text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="500"
              fill="#666"
            >
              {trait.name}
            </text>
          );
        })}
      </svg>
      
      {/* Legend - displaying actual values */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 text-sm mx-auto max-w-xs">
        {traitArray.map(trait => (
          <div key={trait.name} className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">{trait.name}:</span>
            <div className="flex items-center">
              <div 
                className="h-2 w-2 rounded-full bg-primary mr-2"
              />
              <span>{trait.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalityChart;
