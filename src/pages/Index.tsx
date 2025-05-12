
import React, { useState, useEffect } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { SampleProfileSection } from "@/components/landing/SampleProfileSection";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/landing/HeroSection";
import { ChatWithAISection } from "@/components/landing/ChatWithAISection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WarmIntrosSection } from "@/components/landing/warm-intros/WarmIntrosSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CallToActionSection } from "@/components/landing/CallToActionSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { SafetyTrustSection } from "@/components/landing/SafetyTrustSection";
import { useIsMobile } from "@/hooks/use-mobile";

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

const Index = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
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

  // Function to open waitlist modal
  const openWaitlist = () => {
    setIsWaitlistOpen(true);
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
          console.error("IndexPage: Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
          setWaitlistCount(actualCount + WAITLIST_BOOST);
        }
      } catch (error) {
        console.error("IndexPage: Error in waitlist count fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      
      {/* Hero Section */}
      <HeroSection 
        waitlistCount={waitlistCount}
        isLoading={isLoading}
        onOpenWaitlist={openWaitlist}
        onScrollToHowItWorks={scrollToHowItWorks}
      />

      {/* How It Works Section - Added extra padding to compensate for moving up the carousel */}
      <div className="pt-16">
        <HowItWorksSection />
      </div>

      {/* Chat With AI Section - with explicit white background */}
      <ChatWithAISection />

      {/* Example Warm Intros Section - without images in this section */}
      <WarmIntrosSection onOpenWaitlist={openWaitlist} />

      {/* Sample Profile Section */}
      <SampleProfileSection />
      
      {/* Safety & Trust Section */}
      <SafetyTrustSection />
      
      {/* Privacy Section */}
      <PrivacySection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Call to Action */}
      <CallToActionSection onOpenWaitlist={openWaitlist} />

      {/* Waitlist Form Modal */}
      <WaitlistForm 
        open={isWaitlistOpen} 
        onOpenChange={setIsWaitlistOpen} 
      />
    </div>
  );
};

export default Index;
