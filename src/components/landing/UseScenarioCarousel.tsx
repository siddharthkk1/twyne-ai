
import React, { useState, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  IoLocationSharp,
  IoHeartSharp,
  IoArrowForward,
  IoPeople,
  IoBookSharp,
  IoFlashSharp,
  IoPerson,
  IoCafe,
  IoChatbubbleEllipses
} from "react-icons/io5";

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
  const [autoplay, setAutoplay] = useState(true);

  // Define all use scenarios - updated to match with RotatingUseScenarios
  const scenarios: ScenarioItem[] = [
    {
      id: 1,
      icon: IoLocationSharp,
      title: "I'm a new grad who just moved to a new city and don't know anyone.",
      description: "Twyne helps you meet people nearby who share your vibe, not just your zip code.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 2,
      icon: IoHeartSharp,
      title: "I work remotely and barely see people during the week.",
      description: "Find activity partners who match your schedule and skill level for regular adventures.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      id: 3,
      icon: IoCafe,
      title: "I want friendships that aren't random roommates or coworkers.",
      description: "Connect with professionals in similar fields who understand your unique work challenges.",
      iconBgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: 4,
      icon: IoPeople,
      title: "I want deep conversations about books over coffee.",
      description: "Meet fellow intellectuals who enjoy discussing ideas, theories, and literature in cozy settings.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 5,
      icon: IoPerson,
      title: "I'm looking for NBA fans to watch games with.",
      description: "Find fellow basketball enthusiasts to cheer on your team and debate stats over beers.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      id: 6,
      icon: IoArrowForward,
      title: "I've outgrown my old circles and want to rebuild.",
      description: "Not everyone grows with you. Twyne helps you find people who match your pace and your path.",
      iconBgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: 7,
      icon: IoPerson,
      title: "I have friends but no one I feel deeply connected with.",
      description: "Find people who truly understand you and create deeper, more meaningful friendships.",
      iconBgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: 8,
      icon: IoBookSharp,
      title: "I'm a foodie looking for friends to try restaurants with.",
      description: "Connect with fellow food enthusiasts who are always up for culinary adventures in your city.",
      iconBgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
  ];

  // Auto-rotate slides every 5 seconds, but pause on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoplay) {
      interval = setInterval(() => {
        setActiveSlide((prevSlide) => (prevSlide + 1) % scenarios.length);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [scenarios.length, autoplay]);

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Find Your People</h2>
          <p className="text-muted-foreground">
            Twyne connects you with like-minded people, whatever your situation
          </p>
        </div>
        
        <Carousel 
          className="w-full" 
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <CarouselContent>
            {scenarios.map((scenario) => (
              <CarouselItem 
                key={scenario.id} 
                className="transition-opacity duration-500"
                style={{
                  opacity: activeSlide === scenario.id - 1 ? 1 : 0
                }}
              >
                <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 flex flex-col items-center text-center">
                  <div className={`rounded-full ${scenario.iconBgColor} p-4 inline-flex mb-5`}>
                    <scenario.icon className={`h-6 w-6 ${scenario.iconColor}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4">"{scenario.title}"</h3>
                  <p className="text-lg text-muted-foreground mb-8">{scenario.description}</p>
                  {user ? (
                    <Button asChild size="lg" className="rounded-full px-8 hover:shadow-md transition-all">
                      <Link to="/connections" className="flex items-center">
                        <IoChatbubbleEllipses size={18} className="mr-2" />
                        View Your Connections
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-full px-8 hover:shadow-md transition-all">
                      <Link to="/auth" className="flex items-center">
                        <IoChatbubbleEllipses size={18} className="mr-2" />
                        Connect & Say Hi
                      </Link>
                    </Button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Visual progress bar instead of dots */}
          <div className="flex justify-center mt-6">
            <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{
                  width: `${((activeSlide + 1) / scenarios.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
          
          <div className="hidden md:flex">
            <CarouselPrevious 
              onClick={() => setActiveSlide(prev => (prev === 0 ? scenarios.length - 1 : prev - 1))}
              className="absolute -left-12 sm:-left-4" 
            />
            <CarouselNext 
              onClick={() => setActiveSlide(prev => (prev + 1) % scenarios.length)}
              className="absolute -right-12 sm:-right-4" 
            />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
