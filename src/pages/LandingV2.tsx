
import React, { useState, useEffect } from "react";
import { TopNavBarV2 } from "@/components/TopNavBarV2";
import { useAuth } from "@/contexts/AuthContext";
import { SampleProfileSection } from "@/components/landing/SampleProfileSection";
import { supabase } from "@/integrations/supabase/client";
import { HeroSectionV2 } from "@/components/landing/HeroSectionV2";
import { ChatWithAISectionV2 } from "@/components/landing/ChatWithAISectionV2";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WarmIntrosSection } from "@/components/landing/warm-intros/WarmIntrosSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CallToActionSectionV2 } from "@/components/landing/CallToActionSectionV2";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { SafetyTrustSection } from "@/components/landing/SafetyTrustSection";
import { useIsMobile } from "@/hooks/use-mobile";

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

const LandingV2 = () => {
  const { user } = useAuth();
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Preload hero images
  useEffect(() => {
    const coffeeImg = new Image();
    coffeeImg.src = "/lovable-uploads/319407dd-66e7-4d88-aa96-bdb8ffd89535.png";
    
    const readingImg = new Image();
    readingImg.src = "/lovable-uploads/3971dfb4-3115-4a94-8e5c-b863d344cb77.png";
  }, []);
  
  // Function to scroll to How It Works section
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        setIsLoading(true);
        
        // Instead of using count: 'exact', fetch all entries and count them
        const { data, error } = await supabase
          .from('waitlist')
          .select('id');
        
        if (error) {
          console.error("LandingV2: Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
          setWaitlistCount(actualCount + WAITLIST_BOOST);
        }
      } catch (error) {
        console.error("LandingV2: Error in waitlist count fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBarV2 />
      
      {/* Hero Section */}
      <HeroSectionV2 
        waitlistCount={waitlistCount}
        isLoading={isLoading}
        onScrollToHowItWorks={scrollToHowItWorks}
      />

      {/* How It Works Section - Adjusted padding to be consistent */}
      <div className="pt-6 md:pt-24 pb-0">
        <HowItWorksSection />
      </div>

      {/* Chat With AI Section - with explicit white background */}
      <ChatWithAISectionV2 />

      {/* Example Warm Intros Section - without images in this section */}
      <WarmIntrosSection />

      {/* Sample Profile Section */}
      <SampleProfileSection />
      
      {/* Safety & Trust Section */}
      <SafetyTrustSection />
      
      {/* Privacy Section */}
      <PrivacySection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Call to Action */}
      <CallToActionSectionV2 />
    </div>
  );
};

export default LandingV2;
