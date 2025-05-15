
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
  // Initialize with all cards and track the next card to show
  const [intros, setIntros] = useState<IntroCard[]>([...initialIntros, ...additionalIntros]);
  const [nextHiddenCardIndex, setNextHiddenCardIndex] = useState(0);
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 1 : 6;
  
  // Initialize positions on first render
  useEffect(() => {
    setIntros(current => {
      return current.map((card, index) => {
        if (index < visibleCount) {
          return { ...card, visible: true, position: index };
        }
        return { ...card, visible: false };
      });
    });
  }, [visibleCount]);
  
  // Only apply card rotation for desktop view
  useEffect(() => {
    // Skip the rotation effect if we're on mobile
    if (isMobile) return;
    
    const rotateOneCard = () => {
      setIntros(currentIntros => {
        // Get visible and hidden intros
        const visibleIntros = currentIntros.filter(intro => intro.visible);
        const hiddenIntros = currentIntros.filter(intro => !intro.visible);
        
        // If no hidden intros available, don't change anything
        if (hiddenIntros.length === 0) return currentIntros;
        
        // Pick one random visible card to hide
        const randomVisibleIndex = Math.floor(Math.random() * visibleIntros.length);
        const cardToHide = visibleIntros[randomVisibleIndex];
        
        // Get the position of the card being hidden
        const positionToReplace = cardToHide.position;
        
        // Instead of picking randomly, get the next hidden card in line
        const cardToShow = hiddenIntros[nextHiddenCardIndex % hiddenIntros.length];
        
        // Update the next card index for the next rotation
        setNextHiddenCardIndex(prevIndex => (prevIndex + 1) % hiddenIntros.length);
        
        // Create a new array with the updated visibility states and position
        return currentIntros.map(card => {
          if (card.id === cardToHide.id) return { ...card, visible: false };
          if (card.id === cardToShow.id) return { ...card, visible: true, position: positionToReplace };
          return card; // Keep all other cards unchanged
        });
      });
    };
    
    // Set interval to rotate one card every 5 seconds (only on desktop)
    const interval = setInterval(rotateOneCard, 5000);
    
    return () => clearInterval(interval);
  }, [nextHiddenCardIndex, isMobile]);
  
  // Ensure correct number of visible cards based on screen size
  useEffect(() => {
    setIntros(current => {
      const visibleIntros = current.filter(intro => intro.visible);
      const hiddenIntros = current.filter(intro => !intro.visible);
      const targetVisibleCount = isMobile ? 1 : 6;
      
      // If we already have the correct number, no change needed
      if (visibleIntros.length === targetVisibleCount) return current;
      
      let updatedIntros = [...current];
      
      // If we need more visible cards
      if (visibleIntros.length < targetVisibleCount) {
        // Calculate how many more cards we need to show
        const cardsToAdd = targetVisibleCount - visibleIntros.length;
        // Get that many cards from the hidden ones, starting with the next in line
        const cardsToShow = [];
        for (let i = 0; i < cardsToAdd; i++) {
          const indexToUse = (nextHiddenCardIndex + i) % hiddenIntros.length;
          cardsToShow.push(hiddenIntros[indexToUse]);
        }
        
        // Update the next card index after adding these cards
        setNextHiddenCardIndex((nextHiddenCardIndex + cardsToAdd) % hiddenIntros.length);
        
        // Update visibility for these cards and assign positions
        updatedIntros = current.map(card => {
          if (cardsToShow.some(c => c.id === card.id)) {
            // Find the next available position
            const usedPositions = visibleIntros.map(v => v.position);
            const availablePositions = Array.from({ length: targetVisibleCount }, (_, i) => i)
              .filter(pos => !usedPositions.includes(pos));
            
            return { 
              ...card, 
              visible: true,
              position: availablePositions[0]
            };
          }
          return card;
        });
      } 
      // If we need to hide some cards
      else if (visibleIntros.length > targetVisibleCount) {
        // Calculate how many cards we need to hide
        const cardsToRemove = visibleIntros.length - targetVisibleCount;
        // Get that many cards from the visible ones
        const cardsToHide = visibleIntros.slice(0, cardsToRemove);
        
        // Update visibility for these cards
        updatedIntros = current.map(card => {
          if (cardsToHide.some(c => c.id === card.id)) {
            return { ...card, visible: false };
          }
          return card;
        });
      }
      
      return updatedIntros;
    });
  }, [isMobile, nextHiddenCardIndex]);
  
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
