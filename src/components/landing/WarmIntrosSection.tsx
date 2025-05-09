
import React from "react";
import { Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WarmIntrosSectionProps {
  onOpenWaitlist: () => void;
}

export const WarmIntrosSection = ({ onOpenWaitlist }: WarmIntrosSectionProps) => {
  return (
    <section className="py-16 bg-muted/10">
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
          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Nina</span> both love basketball, burritos, and late-night debates.
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>
          
          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-secondary/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Priya</span> both read too many psychology books and have 300+ tabs open.
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>
          
          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-accent/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Chris</span> are both getting married in a month and feeling all the chaos and excitement.
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>
          
          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Lena</span> both just moved to the city and are figuring out how to feel at home here.
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>

          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-secondary/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Ethan</span> are both in healthcare and could use a break from being everyone else's support system. Walk and talk?
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>
          
          <div className="bg-background rounded-xl p-6 pb-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/20 hover:border-primary/20">
            <p className="text-lg mb-2">
              <span className="font-semibold">You and Jay</span> are both startup people—figuring out life, product-market fit, and how to have hobbies again. Coffee?
            </p>
            <Button 
              onClick={onOpenWaitlist}
              variant="default" 
              size="sm"
              className="rounded-full w-full md:w-auto self-end mb-3 hover:shadow-md transition-all"
            >
              <MessageCircle size={16} className="mr-1" />
              Connect & Say Hi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
