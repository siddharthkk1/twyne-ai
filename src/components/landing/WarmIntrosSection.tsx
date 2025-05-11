
import React, { useState, useEffect } from "react";
import { Sparkles, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface WarmIntrosSectionProps {
  onOpenWaitlist: () => void;
}

// Define card type interface
interface IntroCard {
  id: number;
  text: string;
  visible: boolean;
  isGroup?: boolean;
  position?: number; // Add position to track the slot in the UI
}

// Define all intro cards data
const initialIntros: IntroCard[] = [
  {
    id: 1,
    text: "You and Nina both love basketball, burritos, and late-night debates.",
    visible: true,
    position: 0
  },
  {
    id: 2,
    text: "You and Priya both read too many psychology books and have 300+ tabs open.",
    visible: true,
    position: 1
  },
  {
    id: 3, 
    text: "You and Chris are both getting married in a month and feeling all the chaos and excitement.",
    visible: true,
    position: 2
  },
  {
    id: 4,
    text: "You, Lena, and Zara all just moved to the city and are figuring out how to feel at home here.",
    visible: true,
    isGroup: true,
    position: 3
  },
  {
    id: 5,
    text: "You, Lexi, and Ethan are all in healthcare and could use a break from being everyone else's support system. Walk and talk?",
    visible: true,
    isGroup: true,
    position: 4
  },
  {
    id: 6,
    text: "You and Jay are both startup people—figuring out life, product-market fit, and how to have hobbies again. Coffee?",
    visible: true,
    position: 5
  }
];

const additionalIntros: IntroCard[] = [
  {
    id: 7,
    text: "You and Tre both grew up watching LeBron chase greatness—and never back down from the GOAT debate. MJ or Bron? You've got takes.",
    visible: false
  },
  {
    id: 8,
    text: "You and Amara both read spicy books faster than your TBR can handle. Sarah J. Maas? Colleen Hoover? You've got annotated paperbacks and a lot of opinions.",
    visible: false
  },
  {
    id: 9,
    text: "You, Sabina, and Lily are Swifties fluent in Easter eggs, healing arcs, and midnight spirals. Reputation's underrated—you all know it.",
    visible: false,
    isGroup: true
  },
  {
    id: 10,
    text: "You and Noah both play games to decompress—whether it's Valorant, Stardew, or something in-between. You speak in Discord emojis and side quests.",
    visible: false
  },
  {
    id: 11,
    text: "You and Zayn are both gym rats with a soft side. You lift heavy, journal often, and still believe in character development.",
    visible: false
  },
  {
    id: 12,
    text: "You and Sam both grew up on anime, still think about the Attack on Titan finale, and maybe cried during Your Name.",
    visible: false
  }
];

export const WarmIntrosSection = ({ onOpenWaitlist }: WarmIntrosSectionProps) => {
  // Initialize with all cards and track the next card to show
  const [intros, setIntros] = useState<IntroCard[]>([...initialIntros, ...additionalIntros]);
  const [nextHiddenCardIndex, setNextHiddenCardIndex] = useState(0);
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 4 : 6;
  
  // Initialize positions on first render
  useEffect(() => {
    setIntros(current => {
      return current.map((card, index) => {
        if (card.visible) {
          return { ...card, position: index };
        }
        return card;
      });
    });
  }, []);
  
  // Rotate one card every 5 seconds
  useEffect(() => {
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
    
    // Set interval to rotate one card every 5 seconds
    const interval = setInterval(rotateOneCard, 5000);
    
    return () => clearInterval(interval);
  }, [nextHiddenCardIndex]);
  
  // Ensure correct number of visible cards based on screen size
  useEffect(() => {
    setIntros(current => {
      const visibleIntros = current.filter(intro => intro.visible);
      const hiddenIntros = current.filter(intro => !intro.visible);
      const targetVisibleCount = isMobile ? 4 : 6;
      
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
            const availablePositions = Array.from(Array(targetVisibleCount).keys())
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
          {/* Sort by position before rendering to maintain position in the grid */}
          {intros
            .filter(intro => intro.visible)
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(intro => (
            <div 
              key={intro.id}
              className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20 animate-fade-in"
              style={{ 
                height: "240px",
                width: "100%"
              }}
            >
              {/* Group indicator for group intros */}
              {intro.isGroup && (
                <div className="mb-2 flex items-center text-primary">
                  <Users size={16} className="mr-1" />
                  <span className="text-xs font-medium">Group</span>
                </div>
              )}
              <p className="text-lg mb-2">
                <span className="font-semibold">
                  {intro.text.split(intro.isGroup ? " all " : " both ")[0]}
                </span>
                {intro.isGroup 
                  ? (" all " + intro.text.split(" all ")[1])
                  : (" both " + intro.text.split(" both ")[1])}
              </p>
              <div className="mt-auto">
                <Button 
                  onClick={onOpenWaitlist}
                  variant="default" 
                  size="sm"
                  className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
                >
                  <MessageCircle size={16} className="mr-1" />
                  Connect & Say Hi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

