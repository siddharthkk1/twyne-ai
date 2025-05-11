
import React from "react";
import { ShieldCheck, UserCheck, MessageSquareOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SafetyTrustSection = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="rounded-full bg-green-100 p-3 inline-flex mb-4">
            <ShieldCheck className="h-6 w-6 text-green-700" />
          </div>
          <h2 className="text-3xl font-bold">Safety & Trust By Design</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            We've built safety into every aspect of Twyne to help you connect with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border border-border/20">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <UserCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-primary">🟣</span> Real People, Not Bots
              </h3>
              <p className="text-muted-foreground">
                <span className="font-medium">Focus:</span> Authenticity & identity verification
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-muted-foreground">
                <li>Phone verification required to join</li>
                <li>AI-generated profiles based on real user responses</li>
                <li>We monitor for fake or bot-like behavior</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-all border border-border/20">
            <CardContent className="pt-6">
              <div className="rounded-full bg-secondary/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <MessageSquareOff className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-secondary">🔵</span> No Unwanted Contact
              </h3>
              <p className="text-muted-foreground">
                <span className="font-medium">Focus:</span> Control over interaction & boundaries
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-muted-foreground">
                <li>Mutual consent required</li>
                <li>Control what information is shared</li>
                <li>Pause intros or go invisible anytime</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-all border border-border/20">
            <CardContent className="pt-6">
              <div className="rounded-full bg-accent/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-accent">🩷</span> Protection & Accountability
              </h3>
              <p className="text-muted-foreground">
                <span className="font-medium">Focus:</span> Response systems & safety enforcement
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-muted-foreground">
                <li>Block or report users at any time</li>
                <li>We review every report and take action when needed</li>
                <li>Our systems monitor harmful behavior proactively</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
