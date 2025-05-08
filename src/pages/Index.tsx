
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, MessageCircle, Share2, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 flex-1 gradient-bg">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="rounded-full bg-primary/20 p-4 inline-flex">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
              Meet people nearby who actually vibe with you
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
              Connect through meaningful conversations. No swiping. No awkward bios.
              Just authentic connections with people who get you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/onboarding" className="flex items-center">
                  Get Started
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Our approach to building meaningful connections</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Chat with Twyne</h3>
              <p className="text-muted-foreground">
                Have natural conversations with our AI that gets to know your interests, personality, and values.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Weekly Introductions</h3>
              <p className="text-muted-foreground">
                Get introduced to 1-2 people nearby who match your vibe, interests, and values.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
              <p className="text-muted-foreground">
                Message first or meet up for coffee. You decide what feels right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-8 md:p-12">
            <div className="flex flex-col items-center text-center gap-4">
              <Share2 className="h-12 w-12 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Ready to find your perfect connections?</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Start chatting with our AI today and begin your journey to making meaningful connections.
              </p>
              <Button className="mt-4 rounded-full px-8" asChild size="lg">
                <Link to="/onboarding">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
