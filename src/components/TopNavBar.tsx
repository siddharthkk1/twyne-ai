
import React from "react";
import { Link } from "react-router-dom";

export const TopNavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl gradient-text">Twyne</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/onboarding" className="text-foreground/80 hover:text-primary transition-colors">
            Get Started
          </Link>
          <Link to="/connections" className="text-foreground/80 hover:text-primary transition-colors">
            Connections
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/chat/twyne" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Chat with AI
          </Link>
        </div>
      </div>
    </nav>
  );
};
