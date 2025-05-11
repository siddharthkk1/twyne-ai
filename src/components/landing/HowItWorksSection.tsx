
import React from "react";
import { MessageCircle, MapPin, Users } from "lucide-react";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
        </div>
        
        {/* Images positioned on left and right sides */}
        <div className="hidden md:block">
          {/* Basketball image on left */}
          <div className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 opacity-60 max-w-[200px] lg:max-w-[280px]">
            <div className="relative">
              <img 
                src="/lovable-uploads/3be4369e-0545-468f-ac65-881cf739a4e7.png" 
                alt="Basketball Players" 
                className="h-auto w-full object-contain"
              />
              <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>
          
          {/* Reading people image on right */}
          <div className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 opacity-60 max-w-[200px] lg:max-w-[280px]">
            <div className="relative">
              <img 
                src="/lovable-uploads/dfa15283-ccbd-44d6-be07-aacaf7436b85.png" 
                alt="People Reading" 
                className="h-auto w-full object-contain"
              />
              <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Chat with Twyne</h3>
            <p className="text-muted-foreground">
              Have natural conversations with our AI that learns your vibe, interests, and values.
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
            <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Local Connections</h3>
            <p className="text-muted-foreground">
              Get introduced to 1-2 people in your city who genuinely share your energy and interests.
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
            <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
            <p className="text-muted-foreground">
              You decide how things unfold—from a chill convo to a real-world hang.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
