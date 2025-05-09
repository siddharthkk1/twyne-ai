
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Sparkles } from "lucide-react";
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
    <section className="relative py-16 md:py-24 mt-14 overflow-hidden bg-white">
      {/* Abstract shapes for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 animate-pulse-slow"></div>
        <div className="absolute top-40 -left-32 w-96 h-96 rounded-full bg-secondary/5"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent/5 animate-pulse-slow"></div>
        
        {/* Abstract lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent"></div>
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
          
          {/* Main title with fade-in from right and enhanced gradient */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-none whitespace-nowrap overflow-hidden max-w-full pb-3 mt-1 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <span className="text-primary">
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
              className="rounded-full px-8 bg-primary/10 backdrop-blur-sm border-primary/30 hover:bg-primary/20 hover-scale text-primary font-medium"
              onClick={onScrollToHowItWorks}
            >
              Learn More
            </Button>
          </div>
          
          {/* Visual decorative element - sparkle icon */}
          <div 
            className={`absolute top-20 right-8 md:right-20 transition-all duration-700 transform hidden md:block ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{ transitionDelay: '1100ms' }}
          >
            <Sparkles className="text-primary/70 w-12 h-12 animate-pulse-slow" />
          </div>
          
          {/* Decorative dot pattern */}
          <div className="absolute left-10 bottom-20 hidden md:flex flex-wrap w-32 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-700 delay-[${i * 100}ms] ${
                  isVisible ? 'bg-primary/40 scale-100' : 'bg-transparent scale-0'
                }`}
              ></span>
            ))}
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
          
          {/* Illustrative wave pattern */}
          <div className="w-full absolute bottom-0 left-0 h-8 opacity-20">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                className="fill-primary/10"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
