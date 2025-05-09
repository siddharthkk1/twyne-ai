
import React, { useState } from "react";
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
  
  return (
    <section className="relative py-20 md:py-28 gradient-bg mt-14">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center gap-5 animate-fade-in">
          <div className="rounded-full bg-primary/20 p-4 inline-flex mb-7">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight gradient-text leading-none whitespace-nowrap overflow-hidden max-w-full pb-3">
            Meet people you vibe with in your city
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
            Our AI gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-3">
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
                  className="rounded-full px-8 hover-scale"
                  onClick={onOpenWaitlist}
                >
                  Join Waitlist
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
                
                {!isLoading && waitlistCount !== null && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground mt-3 bg-muted/40 py-1 px-3 rounded-full">
                    <Users size={16} className="mr-2 text-primary" />
                    <span>{waitlistCount.toLocaleString()} people already on the waitlist</span>
                  </div>
                )}
              </div>
            )}
            <Button variant="outline" size="lg" className="rounded-full px-8 glass-effect" onClick={onScrollToHowItWorks}>
              Learn More
            </Button>
          </div>
          
          {/* Rotating text with improved vertical spacing */}
          <div className="mt-8 w-full overflow-hidden"> 
            <RotatingUseScenarios />
          </div>
        </div>
      </div>
    </section>
  );
};
