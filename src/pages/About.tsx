
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <section className="py-16 px-4 md:px-6 bg-background text-foreground">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About Twyne</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Why we started Twyne—and what we’re here to fix.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">🌍 The Problem</h2>
            <p>
              We’re more connected than ever—and somehow, still lonelier than ever.
              Social isolation has quietly become one of the biggest public health issues
              of our time. The U.S. Surgeon General has called loneliness an epidemic.
              Anxiety, disconnection, and emotional flatness are rising—especially among
              young adults.
            </p>
            <p>
              We have feeds, group chats, dating apps, and DMs... but for a lot of people,
              <strong> true friendship still feels out of reach.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You move to a new city and don’t know where to start</li>
              <li>You graduate, and suddenly your social circle disappears</li>
              <li>You work remotely, and your days feel quiet—even with constant notifications</li>
              <li>You want to connect, but don’t want to swipe through bios or show up to a room full of strangers</li>
            </ul>
            <p>This isn’t just about being alone. It’s about <strong>not feeling understood.</strong></p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">🤝 What We’re Building</h2>
            <p>
              Twyne is a new kind of social app—one that actually helps people meet others
              who feel like a natural fit.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>No swiping. No personal branding. No pressure.</li>
              <li>You chat with our AI—it gets to know your personality, energy, interests, and life.</li>
              <li>Once a week, it introduces you to someone nearby you’re likely to vibe with.</li>
              <li>You can chat, meet up, or just see where it goes. No stress. No script.</li>
            </ul>
            <p>
              We believe in quiet social magic. Not hypergrowth. Not virality. Just people meeting people—
              naturally, meaningfully, one good intro at a time.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">💡 Why We Exist</h2>
            <p>
              Twyne exists because modern life makes real connection hard—and that doesn’t have to be the case.
            </p>
            <p>
              We’re not here to replace human connection with tech. We’re here to use tech to <strong>clear the noise
              and create space</strong> for real relationships to form.
            </p>
            <p>
              Because everyone deserves to feel seen. Everyone deserves to feel chosen. And everyone deserves to
              find people they genuinely vibe with.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
