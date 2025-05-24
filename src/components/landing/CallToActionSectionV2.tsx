
import React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CallToActionSectionV2 = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/onboarding");
  };

  return (
    <section className="py-8 md:py-16">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 md:p-12 border border-white/20 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <Share2 className="h-12 w-12 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to find your authentic connections?</h2>
            <p className="max-w-[600px] text-muted-foreground">
              Start your journey today and discover people in your city who truly match your vibe.
            </p>
            <Button 
              onClick={handleGetStarted}
              className="mt-4 rounded-full px-8 hover-scale" 
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
