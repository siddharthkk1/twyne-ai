
import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SocialProofSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="rounded-full bg-primary/10 p-3 inline-flex mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Real stories from people who've made meaningful connections through Twyne
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <Card className="bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex mb-4 text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <p className="text-foreground italic mb-6">
                "After moving to Chicago, I tried a bunch of apps to meet people. Twyne is the only one that connected me with people I genuinely clicked with. I've made two real friends who I hang out with weekly now!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">JS</div>
                <div className="ml-3">
                  <p className="font-semibold">Jamie S.</p>
                  <p className="text-sm text-muted-foreground">Chicago, IL</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Testimonial 2 */}
          <Card className="bg-background border border-border/50 hover:border-secondary/30 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex mb-4 text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <p className="text-foreground italic mb-6">
                "As an introvert who hates forced social situations, Twyne was perfect. The AI somehow figured out exactly what kind of people I'd get along with. The conversations flow so naturally with my matches."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-medium">RL</div>
                <div className="ml-3">
                  <p className="font-semibold">Ray L.</p>
                  <p className="text-sm text-muted-foreground">Austin, TX</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Testimonial 3 */}
          <Card className="bg-background border border-border/50 hover:border-accent/30 hover:shadow-md transition-all md:col-span-2 lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex mb-4 text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <p className="text-foreground italic mb-6">
                "I've tried so many friendship apps that felt like dating sites. Twyne is different—it focuses on deep compatibility, not superficial stuff. I've met people I would have never crossed paths with otherwise!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">MK</div>
                <div className="ml-3">
                  <p className="font-semibold">Mira K.</p>
                  <p className="text-sm text-muted-foreground">Seattle, WA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
