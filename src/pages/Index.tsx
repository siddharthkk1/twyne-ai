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

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

const Index = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
        console.log("IndexPage: Fetching waitlist count...");
        
        // Instead of using count: 'exact', fetch all entries and count them
        const { data, error } = await supabase
          .from('waitlist')
          .select('id');
        
        // Log the full response data for debugging
        console.log("IndexPage: DETAILED DATA:", data);
        
        if (error) {
          console.error("IndexPage: Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
          console.log("IndexPage: Actual count from DB:", actualCount);
          console.log("IndexPage: Data type:", typeof data);
          console.log("IndexPage: Is data an array?", Array.isArray(data));
          console.log("IndexPage: Setting total count to:", actualCount + WAITLIST_BOOST);
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

      {/* Example Warm Intros Section */}
      <WarmIntrosSection onOpenWaitlist={openWaitlist} />

      {/* Sample Profile Section */}
      <SampleProfileSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Call to Action */}
      <CallToActionSection onOpenWaitlist={openWaitlist} />

      {/* Waitlist Form Modal */}
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </div>
  );
};

export default Index;
