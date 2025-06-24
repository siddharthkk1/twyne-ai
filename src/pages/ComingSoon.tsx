import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, PartyPopper, Zap, Clock, Share2, Heart, Users2, Building2, Sparkles, Brain, TestTube, Shield, MessageCircle } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";

const ComingSoon = () => {
  const { user } = useAuth();
  
  const futureFeatures = [
    {
      icon: Sparkles,
      title: "Personalized Warm Intros",
      description: "AI-powered introductions to people you'll actually vibe with. We learn your personality and connect you with compatible locals who share your energy.",
      status: "In Preview"
    },
    {
      icon: Shield,
      title: "Privacy Control",
      description: "You decide what parts of your Mirror and AI chats can be shared — and when. Twyne might use everything to find your best match, but we'll only show what you want others to see. Fully private by default, with you in the driver's seat.",
      status: "In Preview"
    },
    {
      icon: Heart,
      title: "More Than Friends",
      description: "Whether it's dating, collaborators, or creative partners — Twyne helps you connect with people open to the same things you are.",
      status: "In Preview"
    },
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
      icon: Users2,
      title: "Groups",
      description: "Sometimes it's better with more. Twyne will help you join (or create) small groups based on shared interests, vibes, or intentions — whether it's for deep convos, weekend plans, or just people who get your humor.",
      status: "Coming Soon"
    },
    {
      icon: Building2,
      title: "Communities",
      description: "Intern classes, teams, apartments, schools — even full companies. Twyne helps your group actually feel like a community, with smart intros, shared spaces, and easy ways to connect.",
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
      icon: TestTube,
      title: "Tests",
      description: "From personality quizzes to political compass, love languages to weird internet tests — we'll offer fun, lightweight ways for you to explore yourself and help Twyne understand you even better. Take what resonates, skip what doesn't.",
      status: "Coming Soon"
    },
    {
      icon: Brain,
      title: "The Sandbox",
      description: "You'll chat with different AI personas — each with their own vibe. Some are bold, some thoughtful, some chaotic. How you respond tells us a lot about you, helping Twyne learn your energy, social style, and what types of people you naturally click with.",
      status: "Coming Soon"
    },
    {
      icon: MessageCircle,
      title: "Social Reflections",
      description: "Let friends add their own take on who you are — like a personality reference. It's not a \"review\" — it's what they see in you. Think LinkedIn recs, but for your vibe, your energy, your presence. \"She's the type who brings calm to chaos.\" \"Always asks the kind of questions that matter.\"",
      status: "Coming Soon"
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
            <Link to={user ? "/mirror" : "/landing-v2"} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {user ? "Back to Mirror" : "Back to Home"}
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
                  const isInPreview = feature.status === "In Preview";
                  
                  return (
                    <Card key={index} className={`group hover:shadow-xl transition-all duration-500 border-2 relative overflow-hidden ${
                      isInPreview 
                        ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-white to-secondary/5 hover:from-primary/10 hover:to-secondary/8' 
                        : 'border-muted/50 bg-gradient-to-br from-white to-muted/20 hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/5 hover:to-white'
                    }`}>
                      {/* Subtle tech accent line */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        isInPreview ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gradient-to-r from-muted to-muted-foreground/20'
                      }`} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                              isInPreview 
                                ? 'bg-gradient-to-br from-primary/20 to-accent/20 shadow-sm' 
                                : 'bg-gradient-to-br from-muted to-muted/50'
                            }`}>
                              <IconComponent className={`h-5 w-5 transition-colors duration-300 ${
                                isInPreview ? 'text-primary group-hover:text-accent' : 'text-muted-foreground group-hover:text-primary'
                              }`} />
                            </div>
                            <CardTitle className="text-lg font-semibold leading-tight flex-1 min-w-0">{feature.title}</CardTitle>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                              isInPreview
                                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm group-hover:shadow-md' 
                                : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                              {feature.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/80 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </CardContent>
                      
                      {/* Subtle hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className={`absolute inset-0 ${
                          isInPreview 
                            ? 'bg-gradient-to-br from-primary/5 via-transparent to-accent/5' 
                            : 'bg-gradient-to-br from-primary/3 via-transparent to-primary/3'
                        }`} />
                      </div>
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
