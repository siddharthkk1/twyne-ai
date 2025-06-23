
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, PartyPopper, Zap, Clock, Share2, Heart } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";

const ComingSoon = () => {
  const futureFeatures = [
    {
      icon: MapPin,
      title: "Places",
      description: "Get personalized recs for restaurants, cafes, and venues that match your energy. No more endless scrolling — just places that feel right.",
      status: "Coming Soon"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "We'll surface local happenings you'd actually be into — and show you who else might be going.",
      status: "Coming Soon"
    },
    {
      icon: PartyPopper,
      title: "Party Time",
      description: "With our Partiful integration, Twyne connects you to people attending the same parties — so you're never walking in cold.",
      status: "Coming Soon"
    },
    {
      icon: Zap,
      title: "Smart Plans",
      description: "Twyne will suggest the plan, time, and spot — and drop it straight into your calendar. Zero effort, high vibe.",
      status: "Coming Soon"
    },
    {
      icon: Clock,
      title: "AutoFlow",
      description: "Share your calendar and let Twyne fill it with plans that fit — based on your availability, preferences, and who you click with.",
      status: "Coming Soon"
    },
    {
      icon: Share2,
      title: "More Integrations",
      description: "We're building smart connections with apps like X, Notion, and Apple Notes — so Twyne can learn from where your thoughts already live.",
      status: "Coming Soon"
    },
    {
      icon: Heart,
      title: "More Than Friends",
      description: "Whether it's dating, collaborators, or creative partners — Twyne helps you connect with people open to the same things you are.",
      status: "Available Now"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />

      <div className="container mx-auto px-4 md:px-6 pt-8 mt-16">
        <div className="py-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-transparent"
          >
            <Link to="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      
        <section className="py-12 text-foreground">
          <div className="max-w-5xl mx-auto space-y-16">
            
            {/* Hero Section */}
            <div className="space-y-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                The future of connection is coming.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We're building a whole new way to meet people, discover places, and fill your calendar with meaningful moments.
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Here's what's coming to Twyne — designed to make connection effortless and authentic.
              </p>
            </div>

            {/* Future Features Grid */}
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center">🚀 What's Coming</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  const isAvailable = feature.status === "Available Now";
                  
                  return (
                    <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${isAvailable ? 'border-primary/40 bg-primary/5' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isAvailable ? 'bg-primary/20' : 'bg-muted'}`}>
                              <IconComponent className={`h-5 w-5 ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isAvailable 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {feature.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-center">
                Building with you, one feature at a time
              </h3>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Phase 1: Core Connections (Now Live)</h4>
                    <p className="text-muted-foreground">AI-powered introductions, personality matching, and local friend discovery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Phase 2: Smart Discovery (Coming Q1 2025)</h4>
                    <p className="text-muted-foreground">Places, Events, and Party Time — discover where to go and who you'll meet there.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-primary/40 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Phase 3: Effortless Planning (Coming Q2 2025)</h4>
                    <p className="text-muted-foreground">Smart Plans and AutoFlow — let Twyne handle the logistics of your social life.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-primary/30 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg">Phase 4: Deep Integration (Coming Later 2025)</h4>
                    <p className="text-muted-foreground">More Integrations and expanded connection types — your entire social ecosystem, connected.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Want to help shape what's next?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join our community of early users and help us build the future of human connection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Join the Journey
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">
                    Learn Our Story
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComingSoon;
