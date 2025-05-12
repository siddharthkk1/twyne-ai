
import React from "react";

interface CompatibilityHighlightsProps {
  highlights: string[];
  name: string;
}

export const CompatibilityHighlights: React.FC<CompatibilityHighlightsProps> = ({ highlights, name }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1.5">COMPATIBILITY HIGHLIGHTS</h4>
      {highlights.length > 0 ? (
        <div className="space-y-1.5">
          {highlights.map((highlight, i) => (
            <div key={i} className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-2 text-sm border border-primary/10">
              <span className="font-medium">You both</span> {highlight.substring(9)}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-3 text-sm border border-muted">
          <p className="text-muted-foreground">We'll highlight vibe matches once more is shared.</p>
        </div>
      )}
    </div>
  );
};
