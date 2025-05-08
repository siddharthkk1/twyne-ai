
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const NextMatchesMessage = () => {
  return (
    <div className="bg-secondary/20 rounded-2xl p-6 text-center">
      <div className="rounded-full bg-secondary/30 p-3 inline-flex mb-3">
        <Sparkles className="h-5 w-5 text-secondary" />
      </div>
      <h2 className="font-medium mb-2">Next matches coming soon</h2>
      <p className="text-sm text-muted-foreground mb-4">
        I'm looking for people who match your vibe. New introductions arrive weekly.
      </p>
      <div className="bg-background/50 rounded-xl p-4 mb-5 text-left italic text-sm">
        "You and Jordan both listen to Dominic Fike, journal inconsistently, and drink matcha like it's water."
      </div>
      <Button 
        asChild
        variant="outline" 
        className="rounded-full"
      >
        <Link to="/chat/twyne">Chat with Twyne</Link>
      </Button>
    </div>
  );
};

export default NextMatchesMessage;
