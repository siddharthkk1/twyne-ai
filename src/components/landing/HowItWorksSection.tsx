
import React from "react";
import { MessageCircle, MapPin, Users, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white relative">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mx-auto relative z-10">
          <Card className="p-6 shadow-md flex flex-col items-center text-center bg-background">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Chat with Twyne</h3>
            <p className="text-muted-foreground">
              Have natural conversations with our AI that learns your vibe, interests, and values.
            </p>
          </Card>
          
          <Card className="p-6 shadow-md flex flex-col items-center text-center bg-background">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-7 w-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Local Connections</h3>
            <p className="text-muted-foreground">
              Get introduced to people your age in your city who genuinely share your energy and interests.
            </p>
          </Card>
          
          <Card className="p-6 shadow-md flex flex-col items-center text-center bg-background">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-pink-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
            <p className="text-muted-foreground">
              You decide how things unfold—from a chill convo to a real-world hang.
            </p>
          </Card>
          
          <Card className="p-6 shadow-md flex flex-col items-center text-center bg-background">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Privacy & Safety</h3>
            <p className="text-muted-foreground">
              Your data is secure and you control what you share. We never sell your information.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
