
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const TopNavBar = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-16">
        <Logo />
        
        {/* Desktop Navigation */}
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
              <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
                About
              </Link>
              <Button 
                onClick={() => setIsWaitlistOpen(true)}
                className="bg-gradient-to-r from-primary to-accent text-white border-none rounded-full"
              >
                Join Waitlist
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {user ? (
              <>
                <Link 
                  to="/onboarding" 
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Onboarding
                </Link>
                <Link 
                  to="/connections" 
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connections
                </Link>
                <Link 
                  to="/profile" 
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/chat/twyne" 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Chat with AI
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Button 
                  onClick={() => {
                    setIsWaitlistOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-primary to-accent text-white border-none rounded-full w-fit"
                >
                  Join Waitlist
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </nav>
  );
};
