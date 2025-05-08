
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

const OnboardingWelcome = () => {
  return (
    <div className="bg-background rounded-2xl p-6 text-center space-y-4 animate-fade-in">
      <h2 className="font-medium text-lg">Thanks for sharing about yourself!</h2>
      <p className="text-muted-foreground">
        We're finding people in your area who match your vibe.
        Your first introductions will arrive soon.
      </p>
      <div className="py-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <div className="h-16 w-16 text-primary flex items-center justify-center">
            <User size={36} />
          </div>
        </div>
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

export default OnboardingWelcome;
