
import React from "react";
import { cn } from "@/lib/utils";

interface TwyneOrbProps {
  size?: number;
  pulsing?: boolean;
  className?: string;
}

const TwyneOrb: React.FC<TwyneOrbProps> = ({ 
  size = 16, 
  pulsing = false,
  className
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Core orb with gradient */}
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent/90",
          pulsing ? "animate-pulse-slow" : "",
          className
        )}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.3)`,
        }}
      />
      
      {/* Glow effect outer layer */}
      <div 
        className={cn(
          "absolute rounded-full bg-primary/20 animate-gradient-slow",
          pulsing ? "animate-pulse-slow" : ""
        )}
        style={{
          width: size * 1.5,
          height: size * 1.5,
          filter: "blur(5px)",
          zIndex: -1
        }}
      />
    </div>
  );
};

export default TwyneOrb;
