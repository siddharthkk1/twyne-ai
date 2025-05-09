
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
    <section className="relative py-16 md:py-24 mt-14 overflow-hidden">
      {/* Enhanced background with visible moving gradient */}
      <div className="absolute inset-0 -z-10 bg-light-gradient"></div>
      
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
          
          {/* Main title with fade-in from right and enhanced gradient */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-none whitespace-nowrap overflow-hidden max-w-full pb-3 mt-1 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <span className="gradient-text">
              Meet people you vibe with in your city
            </span>
          </h1>
          
          {/* Description with fade-in from bottom and improved readability */}
          <p 
            className={`max-w-[700px] text-lg md:text-xl text-foreground/90 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
          </p>
          
          {/* Buttons with staggered fade-in */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 mt-3 transition-all duration-700 transform ${
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
              <div className="flex flex-col items-center">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 hover-scale shadow-sm hover:shadow-md transition-all"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
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
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/80 hover-scale text-foreground"
              onClick={onScrollToHowItWorks}
            >
              Learn More
            </Button>
          </div>
          
          {/* Rotating text with improved vertical spacing and fade-in */}
          <div 
            className={`mt-8 w-full overflow-hidden transition-all duration-700 transform ${
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
