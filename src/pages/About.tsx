
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";

const About = () => {
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
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="space-y-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Twyne helps you feel known — and meet people you actually vibe with. 💫
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                
                We're building a slower, softer, more human kind of social platform.
                One that's good for your mental health — and even better for your life.
              </p>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">🌍 Why We Exist</h2>
              <p className="text-lg leading-relaxed">
                We're more connected than ever — and somehow, still lonelier than ever.
              </p>
              <p className="leading-relaxed">
                The U.S. Surgeon General has called loneliness an epidemic. Anxiety, emotional flatness, 
                and disconnection are quietly rising — especially among young adults.
              </p>
              <p className="leading-relaxed">
                We have feeds, group chats, dating apps, and DMs… but for a lot of people, 
                <strong> true connection still feels out of reach.</strong>
              </p>
              
              <div className="bg-muted/30 rounded-lg p-6 my-8">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    You move to a new city and don't know where to start
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    You graduate, and your social circle disappears overnight
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    You work remotely, and your days feel quiet — even with constant notifications
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    You want to connect, but don't want to swipe through bios or show up to a room full of strangers
                  </li>
                </ul>
              </div>

              <p className="text-lg leading-relaxed">
                This isn’t just about being alone — it’s about not feeling understood.
              </p>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">🤝 What We're Building</h2>
              <p className="text-lg leading-relaxed">
                Twyne is a social platform designed for connection — not performance.
              </p>
              <p className="leading-relaxed">
                We help you get to know yourself first — and then introduce you to people you're likely to vibe with.
              </p>
              
              <div className="space-y-6">
                <p className="font-semibold text-lg">Here's how it works:</p>
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  <p className="leading-relaxed">
                    <strong>Chat with our warm, curious AI</strong> — it gets to know your personality, vibe, and story
                  </p>
                  <p className="leading-relaxed">
                    <strong>Once a week, get a warm intro</strong> to someone nearby you're likely to click with
                  </p>
                  <p className="leading-relaxed">
                    <strong>Explore events and your city map</strong> to meet people in real life
                  </p>
                  <p className="leading-relaxed">
                    <strong>Build long-term buddy threads</strong> with people you genuinely connect with
                  </p>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6 text-center">
                <p className="text-lg leading-relaxed">
                  No swiping. No pressure. No personal branding.<br />
                  Just people meeting people — naturally, meaningfully, one good intro at a time.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">💡 What We Believe</h2>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">1. Connection is medicine.</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    We're not meant to go through life alone. Feeling seen, safe, and energized is healing — and essential.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">2. Everyone deserves to be known.</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    You're not "too much" or "not enough." You're a puzzle worth understanding. We help reflect your whole self — without judgment or pressure.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">3. Vibe matters.</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Forget surface-level matching. We care about emotional resonance — people who just get you.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">4. Tech should feel like a friend, not a trap.</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    No endless feeds. No likes. No follower counts. Just thoughtful design that supports your mental health and social well-being.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">5. Positivity is a radical act.</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    In a world built for clicks and cynicism, we build for joy, curiosity, courage, and kindness — one small connection at a time.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">🌆 Our Vision</h2>
              <p className="text-lg leading-relaxed">
                We don't just want to help people make new friends.<br />
                <strong>We want to reshape how connection feels in modern life.</strong>
              </p>
              
              <div className="space-y-6">
                <p className="font-semibold text-lg">We imagine a world where:</p>
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                      Cities feel smaller
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                      Friendship feels easier
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                      People feel more like themselves, more often
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                      Social life is built on small, meaningful moments — not swipes or group chats
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6 text-center bg-muted/10 rounded-lg p-8">
                <p className="leading-relaxed">
                  In this world, no one goes weeks without feeling connected.<br />
                  Connection isn't a project — it's part of the background of your life.
                </p>
                <p className="leading-relaxed">
                  That's what we're working toward.<br />
                  Not a feed. Not a dopamine rush.
                </p>
                <p className="text-lg leading-relaxed">
                  Just a slower, softer, more human kind of network — one that helps us all feel a little more at home, wherever we are.
                </p>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="italic text-muted-foreground text-lg">— The Twyne Team</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
