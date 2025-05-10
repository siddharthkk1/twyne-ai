
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ScenarioItemProps } from "./ScenarioItem";

interface ScenariosCarouselProps {
  scenarios: ScenarioItemProps[];
}

export const ScenariosCarousel: React.FC<ScenariosCarouselProps> = ({ scenarios }) => {
  return (
    <div className="relative">
      <Carousel
        className="w-full max-w-4xl mx-auto"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="-ml-1 md:-ml-4">
          {scenarios.map((scenario, index) => (
            <CarouselItem key={index} className="basis-1/1 md:basis-1/3 px-1 md:px-4">
              <div className="p-4 rounded-lg text-center min-h-[250px] flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm border border-white/10 shadow-md">
                <div className="mb-4">{scenario.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{scenario.title}</h3>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
