
import React, { useState, useEffect } from "react";
import { Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface WarmIntrosSectionProps {
  onOpenWaitlist: () => void;
}

// Define all intro cards data
const initialIntros = [
  {
    id: 1,
    text: "You and Nina both love basketball, burritos, and late-night debates.",
    visible: true
  },
  {
    id: 2,
    text: "You and Priya both read too many psychology books and have 300+ tabs open.",
    visible: true
  },
  {
    id: 3, 
    text: "You and Chris are both getting married in a month and feeling all the chaos and excitement.",
    visible: true
  },
  {
    id: 4,
    text: "You and Lena both just moved to the city and are figuring out how to feel at home here.",
    visible: true
  },
  {
    id: 5,
    text: "You and Ethan are both in healthcare and could use a break from being everyone else's support system. Walk and talk?",
    visible: true
  },
  {
    id: 6,
    text: "You and Jay are both startup people—figuring out life, product-market fit, and how to have hobbies again. Coffee?",
    visible: true
  }
];

const additionalIntros = [
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
    text: "You and Lily are both Swifties fluent in Easter eggs, healing arcs, and midnight spirals. Reputation is underrated and you both know it.",
    visible: false
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
  const [intros, setIntros] = useState([...initialIntros, ...additionalIntros]);
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 4 : 6;
  
  // Function to randomly pick intros for display
  useEffect(() => {
    const rotateIntro = () => {
      // Create a copy of the current intros
      const currentIntros = [...intros];
      
      // First pick a visible intro to replace
      const visibleIntros = currentIntros.filter(intro => intro.visible);
      const randomVisibleIndex = Math.floor(Math.random() * visibleIntros.length);
      const introToHide = visibleIntros[randomVisibleIndex];
      
      // Find all non-visible intros
      const hiddenIntros = currentIntros.filter(intro => !intro.visible);
      
      // If there are no hidden intros, just return
      if (hiddenIntros.length === 0) return;
      
      // Pick a random hidden intro to show
      const randomHiddenIndex = Math.floor(Math.random() * hiddenIntros.length);
      const introToShow = hiddenIntros[randomHiddenIndex];
      
      // Update the visibility states
      setIntros(current => 
        current.map(intro => {
          if (intro.id === introToHide.id) return { ...intro, visible: false };
          if (intro.id === introToShow.id) return { ...intro, visible: true };
          return intro;
        })
      );
    };
    
    // Set interval to rotate intros every 3-5 seconds
    const interval = setInterval(() => {
      rotateIntro();
    }, Math.random() * 2000 + 3000);
    
    return () => clearInterval(interval);
  }, [intros, isMobile]);
  
  // Make sure we have the correct number of visible intros when the screen size changes
  useEffect(() => {
    setIntros(current => {
      // Count currently visible
      const visibleCount = current.filter(intro => intro.visible).length;
      const desiredCount = isMobile ? 4 : 6;
      
      // If we already have the correct number, no change needed
      if (visibleCount === desiredCount) return current;
      
      // If we need to show more
      if (visibleCount < desiredCount) {
        const hiddenIntros = current.filter(intro => !intro.visible);
        const toShow = hiddenIntros.slice(0, desiredCount - visibleCount);
        
        return current.map(intro => {
          if (toShow.some(i => i.id === intro.id)) {
            return { ...intro, visible: true };
          }
          return intro;
        });
      }
      
      // If we need to hide some
      const visibleIntros = current.filter(intro => intro.visible);
      const toHide = visibleIntros.slice(desiredCount);
      
      return current.map(intro => {
        if (toHide.some(i => i.id === intro.id)) {
          return { ...intro, visible: false };
        }
        return intro;
      });
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
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10`}>
          {intros.map(intro => {
            // Only render visible intros and only up to the visibleCount limit
            if (!intro.visible) return null;
            
            return (
              <div 
                key={intro.id}
                className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20 animate-fade-in"
                style={{ 
                  height: "240px", // Fixed height
                  width: "100%" // 100% of the grid cell width
                }}
              >
                <p className="text-lg mb-2">
                  <span className="font-semibold">{intro.text.split(" both ")[0]}</span>
                  {" both " + intro.text.split(" both ")[1]}
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
            );
          })}
        </div>
      </div>
    </section>
  );
};
