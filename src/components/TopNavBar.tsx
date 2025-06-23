
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { WaitlistFollowUpForm } from "@/components/landing/WaitlistFollowUpForm";

export const TopNavBar = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [submittedUserData, setSubmittedUserData] = useState<{email: string, location: string, phoneNumber?: string} | null>(null);
  
  const handleWaitlistSubmit = (userData: {email: string, location: string, phoneNumber?: string}) => {
    setSubmittedUserData(userData);
    setIsWaitlistOpen(false);
    setIsFollowUpOpen(true);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <div className="flex items-center space-x-6">
          <Logo />
          {user && (
            <>
              <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
                About
              </Link>
              <a 
                href="https://twyne.canny.io/feature-requests-and-suggestions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Give Feedback
              </a>
            </>
          )}
        </div>
        
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
              <Link to="/more-than-friends" className="text-foreground/80 hover:text-primary transition-colors">
                More than Friends
              </Link>
              <Link to="/coming-soon" className="text-foreground/80 hover:text-primary transition-colors">
                Coming Soon
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
              <a 
                href="https://twyne.canny.io/feature-requests-and-suggestions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors text-sm md:text-base"
              >
                Give Feedback
              </a>
              <Button 
                onClick={() => setIsWaitlistOpen(true)}
                className="bg-gradient-to-r from-primary to-accent text-white border-none rounded-full px-3 py-1 md:px-4 md:py-2 text-sm md:text-base"
              >
                Join Waitlist
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <WaitlistForm 
        open={isWaitlistOpen} 
        onOpenChange={setIsWaitlistOpen} 
        onSubmitSuccess={handleWaitlistSubmit}
      />
      
      <WaitlistFollowUpForm
        open={isFollowUpOpen}
        onOpenChange={setIsFollowUpOpen}
        userData={submittedUserData}
      />
    </nav>
  );
};
