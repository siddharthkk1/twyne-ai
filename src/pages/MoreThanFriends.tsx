
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Brain, Briefcase, Target, Users, Building } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";

const MoreThanFriends = () => {
  const connectionTypes = [
    {
      icon: Heart,
      title: "Romantic Partners",
      description: "Build something deep from the very first message.",
      details: "Vibe-based matching that goes beyond looks and swipes — real conversations, shared values, emotional chemistry."
    },
    {
      icon: Brain,
      title: "Mentors",
      description: "Learn from people who've walked your path.",
      details: "Find guidance from those whose lived experience aligns with your journey — professionally, creatively, or personally."
    },
    {
      icon: Briefcase,
      title: "Professional Networking",
      description: "Work with people you'd actually grab coffee with.",
      details: "No forced LinkedIn vibes — just natural, aligned connections with people doing meaningful things in your space."
    },
    {
      icon: Target,
      title: "Accountability Buddies",
      description: "Stay on track with someone chasing the same goals.",
      details: "Build motivation and momentum with someone who gets your drive — whether it's fitness, learning, or self-growth."
    },
    {
      icon: Users,
      title: "Therapists & Coaches",
      description: "Find a therapist who truly gets your story.",
      details: "AI-assisted matching with professionals who share your values, background, or even similar struggles — so you feel deeply seen and supported."
    },
    {
      icon: Building,
      title: "Job Opportunities",
      description: "Land roles through connection, not cold apps.",
      details: "Tap into real opportunities through people who believe in you — not just your résumé."
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
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Hero Section */}
            <div className="space-y-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Twyne is just getting started.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                One day, you'll be able to meet all the right people — for every part of life.
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From new friends and romantic sparks to mentors, collaborators, and even therapists, we're building the infrastructure for a whole new way to connect.
              </p>
            </div>

            {/* Future Connection Types Section */}
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center">🔗 Future Connection Types</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {connectionTypes.map((type, index) => {
                  const IconComponent = type.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="text-xl">{type.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base font-medium">
                          "{type.description}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {type.details}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">
                  We're starting with local vibe-based intros for friends.
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  But Twyne's long-term vision is bigger — and we'd love to build it with you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/auth">
                      Join the Journey
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/about">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoreThanFriends;
