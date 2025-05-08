
import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";

interface ScenarioItem {
  id: number;
  title: string;
  description: string;
}

export const RotatingUseScenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedDescription, setDisplayedDescription] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [currentlyTypingTitle, setCurrentlyTypingTitle] = useState(true);
  
  // Define all use scenarios
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      title: "I just moved to a new city and don't know anyone.",
      description: "Twyne helps you meet people nearby who share your vibe, not just your zip code.",
    },
    {
      id: 2,
      title: "I have friends, but none I feel deeply connected to.",
      description: "You're not alone. Twyne helps you find people who actually get you—emotionally, socially, energetically.",
    },
    {
      id: 3,
      title: "I'm in a big transition and want new people who match where I'm at now.",
      description: "You've changed. Your connections should too. Twyne meets you where you are—not who you were.",
    },
    {
      id: 4,
      title: "I'm tired of flaky group chats and surface-level hangs.",
      description: "Twyne introduces you to people who want real conversation and low-key connection.",
    },
    {
      id: 5,
      title: "I'm socially burnt out but still crave meaningful 1:1 interaction.",
      description: "For people who want intentional connection without the overwhelm.",
    },
    {
      id: 6,
      title: "I've outgrown my old circles and want to rebuild my social life consciously.",
      description: "Not everyone grows with you. Twyne helps you find people who match your pace and your path.",
    },
    {
      id: 7,
      title: "I'm introverted and hate swiping or forced mingling, but I do want to meet people.",
      description: "Twyne works quietly in the background, introducing you to people you're likely to vibe with—no profile stalking, no pressure.",
    },
    {
      id: 8,
      title: "I want to meet more people like me—bookworms, creatives, gym rats, third culture kids.",
      description: "Twyne learns your quirks, passions, and micro-interests so it can connect you beyond generic labels.",
    },
  ];

  useEffect(() => {
    // Reset typing state when scenario changes
    setIsTyping(true);
    setDisplayedTitle('');
    setDisplayedDescription('');
    setCharIndex(0);
    setCurrentlyTypingTitle(true);
  }, [activeScenario]);
  
  useEffect(() => {
    if (isTyping) {
      const currentScenario = scenarios[activeScenario];
      const typeSpeed = 30; // milliseconds per character
      
      const typeChar = () => {
        if (currentlyTypingTitle) {
          // Typing the title
          if (charIndex < currentScenario.title.length) {
            setDisplayedTitle(currentScenario.title.substring(0, charIndex + 1));
            setCharIndex(prev => prev + 1);
          } else {
            // Title finished, start description
            setCurrentlyTypingTitle(false);
            setCharIndex(0);
          }
        } else {
          // Typing the description
          if (charIndex < currentScenario.description.length) {
            setDisplayedDescription(currentScenario.description.substring(0, charIndex + 1));
            setCharIndex(prev => prev + 1);
          } else {
            // Both title and description finished
            setIsTyping(false);
            
            // Wait before moving to next scenario
            setTimeout(() => {
              setActiveScenario((prev) => (prev + 1) % scenarios.length);
            }, 4000);
          }
        }
      };
      
      const typingTimeout = setTimeout(typeChar, typeSpeed);
      return () => clearTimeout(typingTimeout);
    }
  }, [isTyping, charIndex, currentlyTypingTitle, activeScenario, scenarios]);

  return (
    <div className="min-h-[200px] flex flex-col items-center text-center max-w-[800px] mx-auto">
      <div className="mb-2 min-h-[60px] flex items-center">
        <h3 className="text-xl md:text-2xl font-bold">
          "<span className="text-primary">{displayedTitle}</span>
          <span className={`${isTyping && currentlyTypingTitle ? 'inline-block' : 'hidden'} w-1 h-6 ml-0.5 bg-primary animate-pulse`}></span>"
        </h3>
      </div>
      
      <p className="text-lg text-muted-foreground min-h-[80px]">
        {displayedDescription}
        <span className={`${isTyping && !currentlyTypingTitle ? 'inline-block' : 'hidden'} w-1 h-5 ml-0.5 bg-muted-foreground animate-pulse`}></span>
      </p>
      
      <div className="flex justify-center gap-2 mt-6">
        {scenarios.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeScenario ? "bg-primary scale-125" : "bg-muted-foreground/30"
            }`}
            onClick={() => {
              if (!isTyping) setActiveScenario(index);
            }}
            aria-label={`Go to scenario ${index + 1}`}
            disabled={isTyping}
          />
        ))}
      </div>
    </div>
  );
};
