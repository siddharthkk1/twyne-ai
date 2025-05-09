
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { RotatingUseScenarios } from "@/components/landing/RotatingUseScenarios";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

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
    <section className="relative py-20 md:py-28 gradient-bg mt-14 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center gap-5">
          {/* Logo with bounce animation */}
          <div 
            className={`rounded-full bg-primary/20 p-4 inline-flex mb-7 transform transition-all duration-700 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <Logo size="lg" />
          </div>
          
          {/* New title with fade-in from left */}
          <h2 
            className={`text-2xl md:text-3xl font-medium tracking-tight text-primary/80 mb-0 pb-0 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            The AI Social Platform
          </h2>
          
          {/* Main title with fade-in from right */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight gradient-text leading-none whitespace-nowrap overflow-hidden max-w-full pb-3 mt-1 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            Meet people you vibe with in your city
          </h1>
          
          {/* Description with fade-in from bottom */}
          <p 
            className={`max-w-[700px] text-lg md:text-xl text-muted-foreground transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
          </p>
          
          {/* Buttons with staggered fade-in */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 mt-3 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '900ms' }}
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
                  className="rounded-full px-8 hover-scale animate-pulse"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
                
                {!isLoading && waitlistCount !== null && (
                  <div 
                    className={`flex items-center justify-center text-sm text-muted-foreground mt-3 bg-muted/40 py-1 px-3 rounded-full transition-all duration-700 ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                    style={{ transitionDelay: '1100ms' }}
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
              className="rounded-full px-8 glass-effect hover-scale"
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
            style={{ transitionDelay: '1300ms' }}
          > 
            <RotatingUseScenarios />
          </div>
        </div>
      </div>
      
      {/* Background decoration elements */}
      <div className="absolute top-20 left-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-[-5%] w-[250px] h-[250px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};
