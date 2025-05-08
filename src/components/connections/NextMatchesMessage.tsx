
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NextMatchesMessage = () => {
  return (
    <div className="bg-secondary/20 rounded-2xl p-6 text-center">
      <h2 className="font-medium mb-2">Next matches coming soon</h2>
      <p className="text-sm text-muted-foreground mb-4">
        I'm looking for people who match your vibe. New introductions arrive weekly.
      </p>
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
