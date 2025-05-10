
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
    <section className="relative py-10 md:py-14 mt-24 overflow-hidden bg-white min-h-[85vh] flex flex-col items-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/30 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary/30 blur-3xl"></div>
          <div className="absolute top-2/3 left-2/3 w-72 h-72 rounded-full bg-accent/30 blur-3xl"></div>
        </div>
      </div>
      
      {/* Modern background with people images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Left background person */}
        <div className="absolute left-0 bottom-0 h-[80vh] w-auto opacity-20 md:opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?q=80&w=3456&auto=format&fit=crop"
            alt="Person silhouette" 
            className="h-full w-auto object-contain object-left-bottom"
            style={{ 
              filter: 'brightness(0.7) contrast(1.2) grayscale(0.8)',
              transform: 'scale(0.95)'
            }} 
          />
        </div>
        
        {/* Right background person */}
        <div className="absolute right-0 bottom-0 h-[80vh] w-auto opacity-20 md:opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=3456&auto=format&fit=crop"
            alt="Person silhouette" 
            className="h-full w-auto object-contain object-right-bottom"
            style={{ 
              filter: 'brightness(0.7) contrast(1.2) grayscale(0.8)',
              transform: 'scale(0.95)'
            }}
          />
        </div>
        
        {/* Center background people group */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[70vh] w-auto opacity-15 hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=3456&auto=format&fit=crop"
            alt="Group of people" 
            className="h-full w-auto object-contain object-bottom"
            style={{ 
              filter: 'brightness(0.8) contrast(1.1) grayscale(0.9)',
              transform: 'scale(0.85)'
            }}
          />
        </div>
        
        {/* Connecting elements */}
        <div className="absolute left-1/2 bottom-[35vh] w-full h-32 -translate-x-1/2">
          <svg width="100%" height="100%" viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,80 C200,20 600,120 800,40" 
                  stroke="url(#gradient)" strokeWidth="4" strokeDasharray="5,5" strokeLinecap="round" fill="transparent" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="50%" stopColor="#D6BCFA" />
                <stop offset="100%" stopColor="#7E69AB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-20">
        <div className="flex flex-col items-center text-center gap-5">
          {/* Title with fade-in from left */}
          <h2 
            className={`text-xl md:text-2xl font-medium tracking-tight text-foreground/80 mb-0 pb-0 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: '200ms', letterSpacing: '-0.01em' }}
          >
            The AI Social Platform
          </h2>
          
          {/* Main title with fade-in from right and gradient */}
          <h1 
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-full pb-3 mt-1 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '400ms', letterSpacing: '-0.02em' }}
          >
            <span className="gradient-text">
              Meet people you vibe with in your city
            </span>
          </h1>
          
          {/* Description with fade-in from bottom */}
          <p 
            className={`max-w-[700px] text-lg md:text-xl text-foreground/80 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '600ms', lineHeight: '1.6' }}
          >
            Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
          </p>
          
          {/* Buttons with horizontal space between them */}
          <div 
            className={`flex flex-col sm:flex-row sm:space-x-4 transition-all duration-700 transform ${
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
              <div className="flex flex-col sm:flex-row sm:space-x-4 items-center">
                {/* Join Waitlist button with purple-to-pink gradient */}
                <Button 
                  size="lg" 
                  className="rounded-full px-8 hover-scale shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primary to-accent text-white border-none font-medium"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
                
                {/* Learn More button with purple gradient */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 bg-gradient-to-r from-primary/90 to-primary/70 text-white border-none font-medium shadow-md hover:shadow-lg mt-4 sm:mt-0"
                  onClick={onScrollToHowItWorks}
                >
                  Learn More
                </Button>
              </div>
            )}
          </div>
          
          {/* Waitlist Count - With adjusted bottom margin */}
          {!isLoading && waitlistCount !== null && (
            <div 
              className={`flex items-center justify-center text-sm text-muted-foreground mt-2 mb-8 bg-white/80 py-1 px-3 rounded-full transition-all duration-700 shadow-sm ${
                isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <Users size={16} className="mr-2 text-primary" />
              <span>{waitlistCount.toLocaleString()} people already on the waitlist</span>
            </div>
          )}
        </div>
      </div>

      {/* Rotating text with full-width carousel */}
      <div 
        className={`w-full transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
        style={{ transitionDelay: '1200ms' }}
      > 
        <RotatingUseScenarios />
      </div>
    </section>
  );
};
