
import React from "react";
import { MessageCircle, MapPin, Users, Shield } from "lucide-react";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-10 md:py-20 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
        </div>
        
        {/* Increased padding between cards in sm and md breakpoints (gap-4 md:gap-6) */}
        {/* Previously was gap-4 md:gap-5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
          {/* Reduced width from 20% to 10% width boost for medium screens */}
          {/* Updated style to be responsive with different widths at different breakpoints */}
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50" 
               style={{ width: '100%', maxWidth: '100%' }}>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Chat with Twyne</h3>
            <p className="text-muted-foreground">
              Have natural conversations with our AI that learns your vibe, interests, and values.
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50"
               style={{ width: '100%', maxWidth: '100%' }}>
            <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Local Connections</h3>
            <p className="text-muted-foreground">
              Get introduced to people your age in your city who genuinely share your energy and interests.
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50"
               style={{ width: '100%', maxWidth: '100%' }}>
            <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
            <p className="text-muted-foreground">
              You decide how things unfold—from a chill convo to a real-world hang.
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50"
               style={{ width: '100%', maxWidth: '100%' }}>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="text-xl font-medium mb-2">Privacy & Safety</h3>
            <p className="text-muted-foreground">
              Your data is secure and you control what you share. We never sell your information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
