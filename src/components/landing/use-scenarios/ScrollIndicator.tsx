
import React from "react";
import { ArrowDown } from "lucide-react";

export const ScrollIndicator: React.FC = () => {
  return (
    <div className="flex justify-center animate-bounce fixed bottom-3 left-0 right-0 z-50">
      <ArrowDown className="h-8 w-8 text-primary/70" />
    </div>
  );
};
