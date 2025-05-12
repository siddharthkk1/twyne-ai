
import React from "react";
import { Badge } from "@/components/ui/badge";

export const SectionDescription: React.FC = () => {
  return (
    <div>
      <h3 className="text-xl md:text-2xl font-bold mb-4">Twyne Card</h3>
      <p className="mb-6">
        Through conversations with our AI, we identify meaningful connections between you and potential friends—your shared interests, complementary energies, and compatible activities.
      </p>
      <p className="mb-6">
        <span className="font-medium">This is not public.</span> These connection cards are only visible between introduced individuals and they contain only information both users have agreed to share.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">No endless swiping</Badge>
        <Badge variant="outline" className="bg-secondary/5 hover:bg-secondary/10">No public profiles</Badge>
        <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10">No awkward icebreakers</Badge>
      </div>
    </div>
  );
};
