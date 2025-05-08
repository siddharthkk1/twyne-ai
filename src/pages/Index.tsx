
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg px-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white animate-pulse-slow"
            >
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
              <path d="M9.6 4.6A2.5 2.5 0 1 1 7.8 8.9h8.9" />
              <path d="M7.8 17.1A2.5 2.5 0 1 0 9.6 13h10.3" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-semibold mb-4 text-foreground tracking-tight">
          twyne
        </h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Meet people nearby who actually vibe with you
        </p>

        <div className="space-y-6 mb-12">
          <div className="p-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <h2 className="font-medium mb-2 text-foreground">No swiping. No awkward bios.</h2>
            <p className="text-muted-foreground text-sm">
              Chat with our AI, and we'll introduce you to people you'll click with.
            </p>
          </div>
          
          <div className="p-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <h2 className="font-medium mb-2 text-foreground">Once a week. Real connections.</h2>
            <p className="text-muted-foreground text-sm">
              Get introduced to 1-2 people nearby who match your vibe, interests, and values.
            </p>
          </div>
          
          <div className="p-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <h2 className="font-medium mb-2 text-foreground">Chat or meet up. No pressure.</h2>
            <p className="text-muted-foreground text-sm">
              Message first or grab a coffee. You decide what feels right.
            </p>
          </div>
        </div>
        <Button asChild className="w-full rounded-full px-8 py-6 text-base">
          <Link to="/onboarding">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
