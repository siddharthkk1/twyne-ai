
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  IoCheckmark
} from "react-icons/io5";

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
          
          {/* Chat simulation - copied from original ChatWithAISection */}
          <div className="flex flex-col items-center w-full max-w-[600px]">
            <div className="w-full max-w-[500px] h-[500px] relative border border-border/50 rounded-2xl bg-gradient-to-br from-background/80 to-background/60 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              
              {/* Chat header */}
              <div className="relative z-10 p-4 border-b border-border/50 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Chat with Twyne AI</h3>
                    <p className="text-xs text-muted-foreground">Getting to know you...</p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="relative z-10 p-4 space-y-4 h-[400px] overflow-hidden">
                {/* AI message */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex-shrink-0"></div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-md p-3 max-w-[80%]">
                    <p className="text-sm">Hey! I'm excited to get to know you. What's something you're really passionate about right now?</p>
                  </div>
                </div>
                
                {/* User message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-primary/10 rounded-2xl rounded-tr-md p-3 max-w-[80%]">
                    <p className="text-sm">I've been really into urban gardening lately. There's something magical about growing your own food in the city.</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-accent flex-shrink-0"></div>
                </div>
                
                {/* AI message */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex-shrink-0"></div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-md p-3 max-w-[80%]">
                    <p className="text-sm">That's beautiful! I love how you describe it as "magical" - it sounds like you find real meaning in that connection to your food and environment. What got you started with urban gardening?</p>
                  </div>
                </div>
                
                {/* User typing indicator */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-primary/10 rounded-2xl rounded-tr-md p-3 max-w-[80%]">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-accent flex-shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
