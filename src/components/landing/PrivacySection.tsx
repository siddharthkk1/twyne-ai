
import React from "react";
import { Shield, Lock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const PrivacySection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <div className="rounded-full bg-primary/10 p-3 inline-flex mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Privacy & Security By Design</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            We prioritize your privacy and data security at every step
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-background p-6 shadow-sm hover:shadow-md transition-all">
            <div className="rounded-full bg-green-100 p-2 w-10 h-10 flex items-center justify-center mb-4">
              <Lock className="h-5 w-5 text-green-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
            <p className="text-muted-foreground mb-4">
              Your sensitive information is encrypted and never shared with other users without your explicit consent.
            </p>
            <Separator className="my-4" />
            <p className="text-sm">
              We use industry-standard encryption to protect your data both in transit and at rest.
            </p>
          </Card>

          <Card className="bg-background p-6 shadow-sm hover:shadow-md transition-all">
            <div className="rounded-full bg-blue-100 p-2 w-10 h-10 flex items-center justify-center mb-4">
              <Eye className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Discovery</h3>
            <p className="text-muted-foreground mb-4">
              We only share relevant connection points—the deeper parts of your story remain for you to reveal on your own terms.
            </p>
            <Separator className="my-4" />
            <p className="text-sm">
              Conversations with our AI help identify shared interests, but you control what personal details are shared when chatting.
            </p>
          </Card>

          <Card className="bg-background p-6 shadow-sm hover:shadow-md transition-all">
            <div className="rounded-full bg-purple-100 p-2 w-10 h-10 flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Data, Your Control</h3>
            <p className="text-muted-foreground mb-4">
              Unlike social media, your personal information isn't public—it's only used to create meaningful connections.
            </p>
            <Separator className="my-4" />
            <p className="text-sm">
              You can delete your data at any time, and we never sell your information to third parties.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
