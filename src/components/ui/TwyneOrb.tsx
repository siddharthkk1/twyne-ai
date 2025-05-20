
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
          "rounded-full bg-gradient-to-br from-primary via-accent/80 to-secondary/90 animate-gradient-slow",
          pulsing ? "animate-pulse-slow" : "",
          className
        )}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.3)`,
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Glow effect outer layer */}
      <div 
        className={cn(
          "absolute rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 animate-gradient-slow",
          pulsing ? "animate-pulse-slow" : ""
        )}
        style={{
          width: size * 1.5,
          height: size * 1.5,
          filter: "blur(5px)",
          zIndex: -1,
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
};

export default TwyneOrb;
