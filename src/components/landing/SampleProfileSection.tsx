
import React, { useState } from "react";
import { ProfileCard } from "./profile-card/ProfileCard";
import { ProfileSwitcher } from "./profile-card/ProfileSwitcher";
import { SectionDescription } from "./profile-card/SectionDescription";
import { connectionProfiles } from "./profile-card/profile-data";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SampleProfileSection = () => {
  const [activeProfile, setActiveProfile] = useState(0);
  const isMobile = useIsMobile();
  const [api, setApi] = useState<any>(null);

  const handleProfileChange = (index: number) => {
    if (api) {
      api.scrollTo(index);
      setActiveProfile(index);
    }
  };

  const handleNextProfile = () => {
    if (api && api.canScrollNext()) {
      api.scrollNext();
      // Let the API's select event handle the index update
    }
  };

  const handlePrevProfile = () => {
    if (api && api.canScrollPrev()) {
      api.scrollPrev();
      // Let the API's select event handle the index update
    }
  };

  // Update active profile when carousel changes
  React.useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setActiveProfile(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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
          <div className="relative">
            <Carousel 
              className="w-full"
              setApi={setApi}
              opts={{
                align: "center",
                loop: false,
              }}
              orientation="horizontal"
            >
              <CarouselContent>
                {connectionProfiles.map((profile, index) => (
                  <CarouselItem key={index} className="w-full">
                    <ProfileCard profile={profile} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Custom navigation controls - arrows and dots */}
            <div className="flex items-center justify-between mt-6">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full" 
                onClick={handlePrevProfile}
                disabled={!api?.canScrollPrev()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous profile</span>
              </Button>

              <ProfileSwitcher 
                activeProfile={activeProfile}
                totalProfiles={connectionProfiles.length}
                onProfileChange={handleProfileChange}
              />

              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full" 
                onClick={handleNextProfile}
                disabled={!api?.canScrollNext()}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
