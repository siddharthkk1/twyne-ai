
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { RotatingUseScenarios } from "@/components/landing/RotatingUseScenarios";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  waitlistCount: number | null;
  isLoading: boolean;
  onOpenWaitlist: () => void;
  onScrollToHowItWorks: (e: React.MouseEvent) => void;
}

export const HeroSection = ({ 
  waitlistCount, 
  isLoading, 
  onOpenWaitlist, 
  onScrollToHowItWorks 
}: HeroSectionProps) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect that staggers the appearance of elements
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <section className="relative py-20 md:py-32 mt-14 overflow-hidden bg-white min-h-[85vh] flex items-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/30 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary/30 blur-3xl"></div>
          <div className="absolute top-2/3 left-2/3 w-72 h-72 rounded-full bg-accent/30 blur-3xl"></div>
        </div>
      </div>
      
      <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col items-center text-center gap-5 pt-8 md:pt-12">
          {/* Title with fade-in from left */}
          <h2 
            className={`text-2xl md:text-3xl font-medium tracking-tight text-foreground/90 mb-0 pb-0 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            The AI Social Platform
          </h2>
          
          {/* Main title with fade-in from right and gradient */}
          <h1 
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-full pb-3 mt-1 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <span className="gradient-text">
              Meet people you vibe with in your city
            </span>
          </h1>
          
          {/* Description with fade-in from bottom */}
          <p 
            className={`max-w-[700px] text-lg md:text-xl text-foreground/90 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
          </p>
          
          {/* Buttons with no space between - swapped styling */}
          <div 
            className={`flex flex-col sm:flex-row sm:space-x-0 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            {user ? (
              <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                <Link to="/connections" className="flex items-center">
                  View Your Connections
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-0 items-center">
                {/* Join Waitlist button with new styling (solid color) */}
                <Button 
                  size="lg" 
                  className="rounded-full px-8 hover-scale shadow-sm hover:shadow-md transition-all"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
                
                {/* Learn More button with gradient styling */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 bg-gradient-to-r from-primary to-accent text-white border-none font-medium shadow-md hover:shadow-lg mt-4 sm:mt-0"
                  onClick={onScrollToHowItWorks}
                >
                  Learn More
                </Button>
                
                {!isLoading && waitlistCount !== null && (
                  <div 
                    className={`flex items-center justify-center text-sm text-muted-foreground mt-3 bg-white/80 py-1 px-3 rounded-full transition-all duration-700 shadow-sm ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                    style={{ transitionDelay: '1000ms' }}
                  >
                    <Users size={16} className="mr-2 text-primary" />
                    <span>{waitlistCount.toLocaleString()} people already on the waitlist</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Rotating text with enhanced animations */}
          <div 
            className={`mt-12 w-full overflow-hidden transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '1200ms' }}
          > 
            <RotatingUseScenarios />
          </div>
        </div>
      </div>
    </section>
  );
};
