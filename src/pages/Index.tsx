
import React, { useState, useEffect } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { SampleProfileSection } from "@/components/landing/SampleProfileSection";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WarmIntrosSection } from "@/components/landing/WarmIntrosSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CallToActionSection } from "@/components/landing/CallToActionSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollIndicator } from "@/components/landing/use-scenarios/ScrollIndicator";

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
    readingImg.src = "/lovable-uploads/7c804f22-0b4e-4a87-a191-18c787590a79.png";
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

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Example Warm Intros Section - without images in this section */}
      <WarmIntrosSection onOpenWaitlist={openWaitlist} />

      {/* Sample Profile Section */}
      <SampleProfileSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Call to Action */}
      <CallToActionSection onOpenWaitlist={openWaitlist} />

      {/* Waitlist Form Modal */}
      <WaitlistForm 
        open={isWaitlistOpen} 
        onOpenChange={setIsWaitlistOpen} 
      />
      
      {/* ScrollIndicator at the bottom of the page */}
      <ScrollIndicator />
    </div>
  );
};

export default Index;
