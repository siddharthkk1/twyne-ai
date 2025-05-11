
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { RotatingUseScenarios } from "@/components/landing/RotatingUseScenarios";
import { ScrollIndicator } from "@/components/landing/use-scenarios/ScrollIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [coffeeImageLoaded, setCoffeeImageLoaded] = useState(false);
  const [readingImageLoaded, setReadingImageLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Animation effect that staggers the appearance of elements
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Track window width for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine if we should center the coffee image (between mobile and desktop breakpoints)
  const shouldCenterCoffeeImage = windowWidth < 1240 && windowWidth >= 768;
  
  // Coffee image dimensions - defined once to maintain consistency
  const coffeeImageWidth = 800;
  
  // Preload images
  useEffect(() => {
    const coffeeImg = new Image();
    coffeeImg.src = "/lovable-uploads/319407dd-66e7-4d88-aa96-bdb8ffd89535.png";
    
    const readingImg = new Image();
    readingImg.src = "/lovable-uploads/3971dfb4-3115-4a94-8e5c-b863d344cb77.png";
  }, []);
  
  return (
    <section className="relative py-10 md:py-14 mt-16 md:mt-24 overflow-hidden bg-white min-h-[85vh] flex flex-col items-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/30 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary/30 blur-3xl"></div>
          <div className="absolute top-2/3 left-2/3 w-72 h-72 rounded-full bg-accent/30 blur-3xl"></div>
        </div>
      </div>
      
      {/* Images container with responsive positioning */}
      <div className="absolute bottom-0 w-full max-w-[1600px] mx-auto">
        {/* Coffee friends illustration - Center of left half */}
        <div 
          className={`absolute bottom-0 pointer-events-none z-0 hidden md:block
            ${coffeeImageLoaded ? 'opacity-80' : 'opacity-0'} transition-opacity duration-500
            ${shouldCenterCoffeeImage ? 'left-1/2 -translate-x-1/2' : 'left-[calc(25%-20px)] -translate-x-1/2'}`}
          style={{ 
            display: windowWidth < 768 ? 'none' : 'block',
            width: `${coffeeImageWidth}px` // Original fixed width in all cases
          }}
        >
          <div className="relative">
            <img 
              src="/lovable-uploads/319407dd-66e7-4d88-aa96-bdb8ffd89535.png" 
              alt="Friends with Coffee" 
              className="h-auto object-contain"
              style={{ width: `${coffeeImageWidth}px` }}
              onLoad={() => setCoffeeImageLoaded(true)}
              loading="eager"
            />
            {/* Gradient overlay for fade effect */}
            <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>

        {/* New Reading illustration - Center of right half */}
        <div 
          className={`absolute bottom-0 pointer-events-none z-0 hidden lg:block
            ${readingImageLoaded ? 'opacity-80' : 'opacity-0'} transition-opacity duration-500
            right-1/4 translate-x-1/2`}
          style={{ 
            right: 'calc(25% - 20px)',  /* Adjusted to match the coffee image positioning */
            bottom: '-30px',
            display: windowWidth < 1240 ? 'none' : 'block'  /* Hide when coffee is centered */
          }}
        >
          <div className="relative">
            <img 
              src="/lovable-uploads/3971dfb4-3115-4a94-8e5c-b863d344cb77.png" 
              alt="People Reading and Using Phone" 
              className="h-auto w-full max-h-[32rem] object-contain"
              onLoad={() => setReadingImageLoaded(true)}
              loading="eager"
            />
            {/* Gradient overlay for fade effect */}
            <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>

        {/* For small mobile - center the coffee illustration */}
        <div 
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-80 z-0 md:hidden
            ${coffeeImageLoaded ? 'opacity-80' : 'opacity-0'} transition-opacity duration-500`}
          style={{
            width: "90vw",  
            maxWidth: `${coffeeImageWidth}px`  // Match the fixed width from above
          }}
        >
          <div className="relative">
            <img 
              src="/lovable-uploads/319407dd-66e7-4d88-aa96-bdb8ffd89535.png" 
              alt="Friends with Coffee" 
              className="h-auto w-full object-contain"
              onLoad={() => setCoffeeImageLoaded(true)}
              loading="eager"
            />
            {/* Gradient overlay for fade effect */}
            <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </div>
      
      <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-20">
        <div className="flex flex-col items-center text-center gap-3 md:gap-4">
          {/* Main title with fade-in from right and gradient */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] max-w-[18ch] pb-2 mt-0 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'
            }`}
            style={{ transitionDelay: '400ms', letterSpacing: '-0.02em' }}
          >
            <span className="gradient-text">
              Meet people you vibe with in your city
            </span>
          </h1>
          
          {/* Description with fade-in from bottom */}
          <div 
            className={`max-w-[700px] text-base sm:text-lg md:text-xl text-foreground/80 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '600ms', lineHeight: '1.6' }}
          >
            <h2 
              className={`text-xl md:text-2xl font-medium tracking-tight text-foreground/80 mb-0 pb-0 transition-all duration-700 transform ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
              }`}
              style={{ transitionDelay: '200ms', letterSpacing: '-0.01em' }}
            >
              The AI platform for making connections and building relationships
            </h2>
            <p className="block mt-1">Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.</p>
          </div>
          
          {/* Buttons with horizontal space between them */}
          <div 
            className={`flex flex-col sm:flex-row sm:space-x-4 w-full sm:w-auto transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            {user ? (
              <Button asChild size="lg" className="rounded-full px-8 hover-scale w-full sm:w-auto">
                <Link to="/connections" className="flex items-center">
                  View Your Connections
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-4 items-center w-full">
                {/* Join Waitlist button with purple-to-pink gradient */}
                <Button 
                  size="lg" 
                  className="rounded-full px-8 hover-scale shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primary to-accent text-white border-none font-medium w-full sm:w-auto"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
                
                {/* Learn More button with purple gradient */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 bg-gradient-to-r from-primary/90 to-primary/70 text-white border-none font-medium shadow-md hover:shadow-lg mt-4 sm:mt-0 w-full sm:w-auto"
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
              className={`flex items-center justify-center text-sm text-muted-foreground mt-2 mb-2 md:mb-4 bg-white/80 py-1 px-3 rounded-full transition-all duration-700 shadow-sm ${
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

      {/* Rotating text with full-width carousel - Adjusted position */}
      <div 
        className={`w-full transition-all duration-700 transform mt-10 sm:mt-16 md:mt-20 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
        style={{ transitionDelay: '1200ms' }}
      > 
        <RotatingUseScenarios />
      </div>
    </section>
  );
};
