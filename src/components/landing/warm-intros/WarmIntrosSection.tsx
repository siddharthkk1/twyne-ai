
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { IntroCardsGrid } from "./IntroCardsGrid";
import { initialIntros, additionalIntros } from "./intros-data";
import { IntroCard } from "./types";

interface WarmIntrosSectionProps {
  onOpenWaitlist: () => void;
}

export const WarmIntrosSection = ({ onOpenWaitlist }: WarmIntrosSectionProps) => {
  // Initialize with all cards made visible
  const [intros, setIntros] = useState<IntroCard[]>(() => {
    const allIntros = [...initialIntros, ...additionalIntros];
    return allIntros.map((intro, index) => ({
      ...intro,
      visible: true,
      position: index
    }));
  });
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 4 : 6;
  
  // Ensure correct number of visible cards based on screen size
  useEffect(() => {
    setIntros(current => {
      const targetVisibleCount = isMobile ? current.length : 6;
      
      return current.map((intro, index) => ({
        ...intro,
        visible: index < targetVisibleCount,
        position: index
      }));
    });
  }, [isMobile]);
  
  return (
    <section className="py-16 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="rounded-full bg-secondary/20 p-3 inline-flex mb-4">
            <Sparkles className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold">How We Introduce People</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates warm, personalized introductions based on genuine commonalities
          </p>
        </div>
        
        <IntroCardsGrid 
          intros={intros}
          onOpenWaitlist={onOpenWaitlist}
        />
      </div>
    </section>
  );
};
