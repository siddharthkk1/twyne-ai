
import React from "react";
import { IntroCardsGrid } from "./IntroCardsGrid";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { initialIntros, additionalIntros } from "./intros-data";

interface WarmIntrosSectionProps {
  onOpenWaitlist?: () => void;
}

export const WarmIntrosSection = ({ onOpenWaitlist }: WarmIntrosSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the v2 landing page
  const isLandingV2 = location.pathname === '/landing-v2';

  // Combine all intros for the grid
  const allIntros = [...initialIntros, ...additionalIntros];

  const handleButtonClick = () => {
    if (isLandingV2) {
      navigate("/onboarding");
    } else if (onOpenWaitlist) {
      onOpenWaitlist();
    }
  };

  const handleOpenWaitlist = () => {
    if (onOpenWaitlist) {
      onOpenWaitlist();
    }
  };

  return (
    <section className="py-8 md:py-16 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Warm Introductions That Feel Natural</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Instead of endless swiping, Twyne creates meaningful connections through thoughtful introductions 
            based on genuine compatibility and shared interests.
          </p>
        </div>
        
        <IntroCardsGrid 
          intros={allIntros}
          onOpenWaitlist={handleOpenWaitlist}
        />
        
        <div className="text-center mt-12">
          <Button 
            onClick={handleButtonClick}
            className="rounded-full px-8 hover-scale" 
            size="lg"
          >
            {isLandingV2 ? 'Get Started' : 'Join Waitlist'}
          </Button>
        </div>
      </div>
    </section>
  );
};
