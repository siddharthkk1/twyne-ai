
import React, { useState } from "react";
import { ProfileCard } from "./profile-card/ProfileCard";
import { ProfileSwitcher } from "./profile-card/ProfileSwitcher";
import { SectionDescription } from "./profile-card/SectionDescription";
import { connectionProfiles } from "./profile-card/profile-data";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SampleProfileSection = () => {
  const [activeProfile, setActiveProfile] = useState(0);
  const isMobile = useIsMobile();
  const [api, setApi] = useState<any>(null);

  const handleProfileChange = (index: number) => {
    setActiveProfile(index);
  };

  const handleNextProfile = () => {
    if (api) {
      api.scrollNext();
    }
    setActiveProfile((prev) => (prev + 1) % connectionProfiles.length);
  };

  const handlePrevProfile = () => {
    if (api) {
      api.scrollPrev();
    }
    setActiveProfile((prev) => (prev - 1 + connectionProfiles.length) % connectionProfiles.length);
  };

  const profile = connectionProfiles[activeProfile];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How You View Others</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Twyne creates personalized connection cards that highlight what you share with each new acquaintance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Section description */}
          <SectionDescription />

          {/* Right side - Profile card with carousel for swiping */}
          <Carousel 
            className="w-full"
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            orientation="horizontal"
          >
            <CarouselContent>
              {connectionProfiles.map((profile, index) => (
                <CarouselItem key={index} className="w-full" onMouseEnter={() => setActiveProfile(index)}>
                  <ProfileCard profile={profile} />
                  
                  {/* Swipe indicators for mobile */}
                  {isMobile && (
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground" 
                        onClick={handlePrevProfile}
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Prev
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground" 
                        onClick={handleNextProfile}
                      >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Only show carousel controls on desktop */}
            {!isMobile && (
              <>
                <CarouselPrevious onClick={handlePrevProfile} />
                <CarouselNext onClick={handleNextProfile} />
              </>
            )}
          </Carousel>

          {/* Profile switcher dots - hidden on mobile */}
          <div className="hidden md:block">
            {/* Empty placeholder to maintain grid layout */}
          </div>
          <ProfileSwitcher 
            activeProfile={activeProfile}
            totalProfiles={connectionProfiles.length}
            onProfileChange={handleProfileChange}
          />
        </div>
      </div>
    </section>
  );
};
