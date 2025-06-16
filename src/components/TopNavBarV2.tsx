
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const TopNavBarV2 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/onboarding");
  };

  const handleLogin = () => {
    navigate("/auth");
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Logo />
        
        {/* Navigation Links (Desktop and Mobile) */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {user ? (
            <>
              <Link to="/mirror" className="text-foreground/80 hover:text-primary transition-colors">
                Your Mirror
              </Link>
              <Link to="/connect" className="text-foreground/80 hover:text-primary transition-colors">
                Connect
              </Link>
              <Link to="/settings" className="text-foreground/80 hover:text-primary transition-colors">
                Settings
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors text-sm md:text-base">
                About
              </Link>
              <Button 
                variant="outline"
                onClick={handleLogin}
                className="text-sm md:text-base"
              >
                Login
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-primary to-accent text-white border-none rounded-full px-3 py-1 md:px-4 md:py-2 text-sm md:text-base"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
