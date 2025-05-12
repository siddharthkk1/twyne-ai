
import React from "react";
import { Interest } from "./types";

interface SharedInterestsProps {
  interests: Interest[];
}

export const SharedInterests: React.FC<SharedInterestsProps> = ({ interests }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1.5">SHARED INTERESTS</h4>
      <div className="flex flex-wrap gap-1.5">
        {interests.map((interest, i) => (
          <div key={i} className="flex items-center bg-muted rounded-full px-2.5 py-0.5 text-xs">
            <interest.icon className="h-3 w-3 mr-1" />
            <span>{interest.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
