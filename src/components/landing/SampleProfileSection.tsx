
import React, { useState } from "react";
import { ProfileCard } from "./profile-card/ProfileCard";
import { ProfileSwitcher } from "./profile-card/ProfileSwitcher";
import { SectionDescription } from "./profile-card/SectionDescription";
import { connectionProfiles } from "./profile-card/profile-data";

export const SampleProfileSection = () => {
  const [activeProfile, setActiveProfile] = useState(0);

  const handleProfileChange = (index: number) => {
    setActiveProfile(index);
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

          {/* Right side - Profile card */}
          <ProfileCard profile={profile} />

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
