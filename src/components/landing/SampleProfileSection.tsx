
import React, { useState } from "react";
import { ProfileCard } from "./profile-card/ProfileCard";
import { ProfileSwitcher } from "./profile-card/ProfileSwitcher";
import { SectionDescription } from "./profile-card/SectionDescription";
import { connectionProfiles } from "./profile-card/profile-data";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SampleProfileSection = () => {
  const [activeProfile, setActiveProfile] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const isMobile = useIsMobile();

  // Set up the API
  React.useEffect(() => {
    if (!api) {
      return;
    }
 
    const onSelect = () => {
      setActiveProfile(api.selectedScrollSnap());
    };
 
    api.on("select", onSelect);
    // Call once to set initial position
    onSelect();
 
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleProfileChange = (index: number) => {
    if (api) {
      api.scrollTo(index);
    } else {
      setActiveProfile(index);
    }
  };

  const handleNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

  const handlePrev = () => {
    if (api) {
      api.scrollPrev();
    }
  };

  const profile = connectionProfiles[activeProfile];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-3xl font-bold">How You View Others</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates personalized connection cards that highlight what you share with each new acquaintance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Section description */}
          <SectionDescription />

          {/* Right side - Profile card with carousel for all screen sizes */}
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
                dragFree: false,
              }}
            >
              <CarouselContent>
                {connectionProfiles.map((profile, index) => (
                  <CarouselItem key={index} className="flex justify-center">
                    <div className="w-full max-w-[500px] mx-auto px-2">
                      <ProfileCard profile={profile} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Profile switcher dots */}
          <div className="hidden md:block">
            {/* Empty placeholder to maintain grid layout */}
          </div>
          <div className="flex justify-center">
            <div className="flex items-center justify-center space-x-4">
              {/* Left arrow button */}
              <Button 
                onClick={handlePrev} 
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-background border border-border/50 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous profile</span>
              </Button>
              
              {/* Dots navigation */}
              <div className="flex justify-center space-x-2">
                {connectionProfiles.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => handleProfileChange(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      activeProfile === index ? 'bg-primary scale-125' : 'bg-muted'
                    }`}
                    aria-label={`Go to profile ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Right arrow button */}
              <Button 
                onClick={handleNext}
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-background border border-border/50 shadow-sm"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
