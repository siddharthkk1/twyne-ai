
import React, { useState, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Heart, ArrowRight, Users, Book, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ScenarioItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

export const UseScenarioCarousel = () => {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  // Define all use scenarios
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      icon: MapPin,
      title: "I just moved to a new city and don't know anyone.",
      description: "Twyne helps you meet people nearby who share your vibe, not just your zip code.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 2,
      icon: Heart,
      title: "I have friends, but none I feel deeply connected to.",
      description: "You're not alone. Twyne helps you find people who actually get you—emotionally, socially, energetically.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      id: 3,
      icon: Zap,
      title: "I'm in a big transition and want new people who match where I'm at now.",
      description: "You've changed. Your connections should too. Twyne meets you where you are—not who you were.",
      iconBgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: 4,
      icon: Users,
      title: "I'm tired of flaky group chats and surface-level hangs.",
      description: "Twyne introduces you to people who want real conversation and low-key connection.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 5,
      icon: User,
      title: "I'm socially burnt out but still crave meaningful 1:1 interaction.",
      description: "For people who want intentional connection without the overwhelm.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      id: 6,
      icon: ArrowRight,
      title: "I've outgrown my old circles and want to rebuild my social life consciously.",
      description: "Not everyone grows with you. Twyne helps you find people who match your pace and your path.",
      iconBgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: 7,
      icon: User,
      title: "I'm introverted and hate swiping or forced mingling, but I do want to meet people.",
      description: "Twyne works quietly in the background, introducing you to people you're likely to vibe with—no profile stalking, no pressure.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 8,
      icon: Book,
      title: "I want to meet more people like me—bookworms, creatives, gym rats, third culture kids.",
      description: "Twyne learns your quirks, passions, and micro-interests so it can connect you beyond generic labels.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % scenarios.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [scenarios.length]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Find Your People</h2>
          <p className="text-muted-foreground">
            Twyne connects you with like-minded people, whatever your situation
          </p>
        </div>
        
        <Carousel className="w-full" setActiveItem={setActiveSlide} activeIndex={activeSlide}>
          <CarouselContent>
            {scenarios.map((scenario) => (
              <CarouselItem key={scenario.id}>
                <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 flex flex-col items-center text-center">
                  <div className={`rounded-full ${scenario.iconBgColor} p-4 inline-flex mb-5`}>
                    <scenario.icon className={`h-8 w-8 ${scenario.iconColor}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4">"{scenario.title}"</h3>
                  <p className="text-lg text-muted-foreground mb-8">{scenario.description}</p>
                  {user ? (
                    <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                      <Link to="/connections" className="flex items-center">
                        View Your Connections
                        <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                      <Link to="/auth" className="flex items-center">
                        Get Started
                        <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-6">
            {scenarios.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeSlide ? "bg-primary scale-125" : "bg-muted-foreground/30"
                }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to scenario ${index + 1}`}
              />
            ))}
          </div>
          <div className="hidden md:flex">
            <CarouselPrevious className="absolute -left-12 sm:-left-4" />
            <CarouselNext className="absolute -right-12 sm:-right-4" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
