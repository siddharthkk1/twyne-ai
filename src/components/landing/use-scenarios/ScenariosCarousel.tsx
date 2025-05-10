import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ScrollIndicator } from "@/components/landing/use-scenarios/ScrollIndicator";

const useScenarios = [
  {
    title: "Find Activity Partners",
    description: "Connect with people who share your hobbies and interests for real-world adventures.",
  },
  {
    title: "Expand Your Social Circle",
    description: "Meet new friends and build meaningful relationships within your local community.",
  },
  {
    title: "Networking Opportunities",
    description: "Discover professionals in your field and create valuable connections for career growth.",
  },
];

export const RotatingUseScenarios: React.FC = () => {
  return (
    <div className="relative">
      <Carousel
        className="w-full max-w-4xl mx-auto"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="-ml-1 md:-ml-4">
          {useScenarios.map((scenario, index) => (
            <CarouselItem key={index} className="basis-1/1 md:basis-1/3 px-1 md:px-4">
              <div className="p-4 rounded-lg text-center min-h-[250px] flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm border border-white/10 shadow-md">
                <h3 className="text-lg font-semibold mb-2">{scenario.title}</h3>
                <p className="text-sm text-foreground/80">{scenario.description}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <ScrollIndicator />
    </div>
  );
};
