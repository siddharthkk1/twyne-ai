
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { Users } from "lucide-react";

export const TopNavBar = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Logo />
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/onboarding" className="text-foreground/80 hover:text-primary transition-colors">
                Onboarding
              </Link>
              <Link to="/connections" className="text-foreground/80 hover:text-primary transition-colors">
                Connections
              </Link>
              <Link to="/profile" className="text-foreground/80 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/chat/twyne" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Chat with AI
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsWaitlistOpen(true)}>
                Join Waitlist
              </Button>
            </div>
          )}
        </div>
      </div>
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </nav>
  );
};
