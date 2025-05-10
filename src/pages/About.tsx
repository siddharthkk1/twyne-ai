
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopNavBar />
      
      {/* Back button positioned closer to the TopNavBar */}
      <div className="container mx-auto px-4 md:px-6 pt-4 mt-16">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 -mt-1 hover:bg-transparent"
        >
          <Link to="/" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Twyne</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg">
                Twyne was created with a simple yet powerful mission: to help people form meaningful connections 
                based on authentic compatibility. In today's world, where digital relationships often feel shallow 
                and transactional, we're building a platform that uses advanced AI to facilitate deeper human 
                connections.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">The Problem We're Solving</h2>
              <p className="text-lg mb-4">
                Despite being more "connected" than ever, many people experience profound loneliness and struggle 
                to form authentic relationships. The reasons are many:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>Moving to new cities where you don't know anyone</li>
                <li>Working remotely and missing daily social interactions</li>
                <li>Finding that existing social apps focus on superficial connections</li>
                <li>Outgrowing old friend circles as your interests and values evolve</li>
                <li>Lacking the time or opportunities to meet compatible people</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Approach</h2>
              <p className="text-lg mb-4">
                Twyne uses a combination of thoughtful human design and sophisticated AI to understand what makes 
                you unique, and then connect you with people who truly resonate with your personality, values, 
                and interests.
              </p>
              <p className="text-lg">
                Unlike other platforms that reduce people to static profiles or superficial swipes, we focus on 
                the nuanced aspects of compatibility and create opportunities for connections to develop naturally.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li><strong>Authenticity:</strong> We encourage real self-expression, not curated personas.</li>
                <li><strong>Depth:</strong> We value meaningful connections over casual networking.</li>
                <li><strong>Privacy:</strong> Your personal information is always protected and secure.</li>
                <li><strong>Inclusivity:</strong> We're creating a platform where everyone belongs and can find their community.</li>
                <li><strong>Growth:</strong> We believe relationships should nurture personal development.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
              <p className="text-lg">
                We're currently in our early stages and building a community of people who share our vision. 
                If you're excited about more meaningful connections in your life, join our waitlist to be 
                among the first to experience Twyne.
              </p>
            </section>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="rounded-full px-8 bg-gradient-to-r from-primary to-accent text-white border-none">
              <Link to="/">Join the Waitlist</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
