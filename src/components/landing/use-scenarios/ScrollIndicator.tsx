
import React from "react";
import { ArrowDown } from "lucide-react";

export const ScrollIndicator: React.FC = () => {
  return (
    <div className="flex justify-center animate-bounce z-30 mt-1">
      <ArrowDown className="h-8 w-8 text-primary/70" />
    </div>
  );
};
