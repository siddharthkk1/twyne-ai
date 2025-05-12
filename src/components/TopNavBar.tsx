
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
        <Logo />
        
        {/* Navigation Links (Desktop and Mobile) */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {user ? (
            <>
              <Link to="/onboarding" className="hidden md:block text-foreground/80 hover:text-primary transition-colors">
                Onboarding
              </Link>
              <Link to="/connections" className="hidden md:block text-foreground/80 hover:text-primary transition-colors">
                Connections
              </Link>
              <Link to="/profile" className="hidden md:block text-foreground/80 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/chat/twyne" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm md:text-base">
                Chat with AI
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors text-sm md:text-base">
                About
              </Link>
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
