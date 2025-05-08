import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, MessageCircle, Share2, Users, MapPin, Sparkles } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { RotatingUseScenarios } from "@/components/landing/RotatingUseScenarios";
import { Logo } from "@/components/Logo";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      {/* Hero Section - with reduced padding */}
      <section className="relative py-10 md:py-12 gradient-bg mt-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text whitespace-nowrap">
              Meet people you vibe with in your city
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
              Twyne gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user ? (
                <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                  <Link to="/connections" className="flex items-center">
                    View Your Connections
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                  <Link to="/auth" className="flex items-center">
                    Get Started
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="rounded-full px-8 glass-effect">
                Learn More
              </Button>
            </div>
            
            {/* Rotating text with minimal spacing */}
            <div className="mt-2 w-full mb-0">
              <RotatingUseScenarios />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - moved up from below */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
                Get introduced to 1-2 people in your city who genuinely match your energy and interests.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
              <p className="text-muted-foreground">
                Message first or meet up for coffee. No pressure—you decide what feels right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Warm Intros Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="rounded-full bg-secondary/20 p-3 inline-flex mb-4">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold">How We Introduce People</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Twyne creates warm, personalized introductions based on genuine commonalities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20">
              <p className="text-lg">
                <span className="font-semibold">You and Nina</span> both love basketball, burritos, and late-night debates.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-secondary/20">
              <p className="text-lg">
                <span className="font-semibold">You and Priya</span> both read too many psychology books and have 300+ tabs open.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-accent/20">
              <p className="text-lg">
                <span className="font-semibold">You and Chris</span> are both dog people who prefer long walks over loud parties.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20">
              <p className="text-lg">
                <span className="font-semibold">You and Tasha</span> are both craving more real conversations but don't always know how to start them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 md:p-12 border border-white/20 shadow-sm">
            <div className="flex flex-col items-center text-center gap-4">
              <Share2 className="h-12 w-12 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Ready to find your authentic connections?</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Start chatting with Twyne today and discover people in your city who truly match your vibe.
              </p>
              {user ? (
                <Button className="mt-4 rounded-full px-8 hover-scale" asChild size="lg">
                  <Link to="/connections">View Your Connections</Link>
                </Button>
              ) : (
                <Button className="mt-4 rounded-full px-8 hover-scale" asChild size="lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
