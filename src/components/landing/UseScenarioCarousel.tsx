import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoLocationSharp,
  IoHeartSharp,
  IoArrowForward,
  IoPeople,
  IoBookSharp,
  IoPerson,
  IoCafe,
  IoChatbubbleEllipses
} from "react-icons/io5";

const scenarios = [
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
];

export const UseScenarioCarousel = () => {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % scenarios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  const goToNextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % scenarios.length);
  }, []);
  const goToPreviousSlide = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? scenarios.length - 1 : prev - 1));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Find Your People</h2>
          <p className="text-muted-foreground">
            Twyne connects you with like-minded people, whatever your situation
          </p>
        </div>

        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeSlide * 100}%)`,
              width: `${scenarios.length * 100}%`,
            }}
          >
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="w-full flex-shrink-0 flex justify-center items-center px-4"
              >
                <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50 flex flex-col items-center text-center w-full max-w-xl h-[350px]">
                  <div className={`rounded-full ${scenario.iconBgColor} p-4 inline-flex mb-5`}>
                    <scenario.icon className={`h-6 w-6 ${scenario.iconColor}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4">"{scenario.title}"</h3>
                  <p className="text-lg text-muted-foreground mb-8">{scenario.description}</p>
                  {user ? (
                    <Button asChild size="lg" className="rounded-full px-8 mt-auto">
                      <Link to="/connections" className="flex items-center">
                        <IoChatbubbleEllipses size={18} className="mr-2" />
                        View Your Connections
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-full px-8 mt-auto">
                      <Link to="/auth" className="flex items-center">
                        <IoChatbubbleEllipses size={18} className="mr-2" />
                        Connect & Say Hi
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2">
            <button onClick={goToPreviousSlide} className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              ←
            </button>
            <button onClick={goToNextSlide} className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
              →
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {scenarios.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeSlide === idx ? "bg-primary w-4" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
