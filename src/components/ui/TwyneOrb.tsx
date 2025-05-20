
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
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
};

export default TwyneOrb;
