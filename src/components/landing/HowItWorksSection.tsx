
import React from "react";
import { MessageCircle, MapPin, Users, Shield } from "lucide-react";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:gap-10 max-w-4xl mx-auto relative z-10">
          <div className="text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Chat with Twyne</h3>
            </div>
            <p className="text-muted-foreground pl-16">
              Have natural conversations with our AI that learns your vibe, interests, and values.
            </p>
          </div>
          
          <div className="text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-medium">Local Connections</h3>
            </div>
            <p className="text-muted-foreground pl-16">
              Get introduced to people your age in your city who genuinely share your energy and interests.
            </p>
          </div>
          
          <div className="text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium">Connect Your Way</h3>
            </div>
            <p className="text-muted-foreground pl-16">
              You decide how things unfold—from a chill convo to a real-world hang.
            </p>
          </div>
          
          <div className="text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-medium">Privacy & Safety</h3>
            </div>
            <p className="text-muted-foreground pl-16">
              Your data is secure and you control what you share. We never sell your information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
