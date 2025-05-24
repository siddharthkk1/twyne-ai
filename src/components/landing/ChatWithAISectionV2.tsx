
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  IoCheckmark
} from "react-icons/io5";
import { ChatWithAISection } from "@/components/landing/ChatWithAISection";

export const ChatWithAISectionV2 = () => {
  const navigate = useNavigate();

  const handleTryItNow = () => {
    navigate("/onboarding");
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How We Get to Know You</h2>
          <p className="text-muted-foreground mt-2">Through conversations that feel refreshingly human</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-items-center">
          {/* Text content - Width reduced by 15% */}
          <div className="space-y-6 w-full max-w-[450px] mb-8 md:mb-0">
            <p className="text-lg">
              Twyne's AI learns your personality, interests, and what matters to you—creating 
              a nuanced picture of who you are.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">Share your interests, values, life story, and what you're looking for</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">Our AI builds a deeper understanding of your vibe than profiles ever could</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">No awkward bios or curated photos—just authentic conversations</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">You choose what information can be shared with others</p>
              </div>
            </div>
            <div>
              <Button 
                className="rounded-full px-8 hover-scale"
                onClick={handleTryItNow}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Try It Now
              </Button>
            </div>
          </div>
          
          {/* Reuse the chat simulation from the original ChatWithAISection */}
          <div className="flex flex-col items-center w-full max-w-[600px]">
            {/* We'll include the chat simulation part from the original component */}
          </div>
        </div>
      </div>
    </section>
  );
};
