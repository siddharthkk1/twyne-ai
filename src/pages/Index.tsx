
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, MessageCircle, Share2, Users, MapPin, Sparkles, Star, StarHalf, MessageSquare } from "lucide-react";
import { TopNavBar } from "@/components/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { RotatingUseScenarios } from "@/components/landing/RotatingUseScenarios";
import { SampleProfileSection } from "@/components/landing/SampleProfileSection";
import { Logo } from "@/components/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { supabase } from "@/integrations/supabase/client";

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

const Index = () => {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to scroll to How It Works section
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        setIsLoading(true);
        console.log("IndexPage: Fetching waitlist count...");
        
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });
        
        console.log("IndexPage: Supabase response:", { count, error });
        
        if (error) {
          console.error("IndexPage: Error fetching waitlist count:", error);
        } else {
          // Add the artificial boost to the actual count
          const actualCount = count !== null ? count : 0;
          console.log("IndexPage: Actual count from DB:", actualCount);
          console.log("IndexPage: Setting total count to:", actualCount + WAITLIST_BOOST);
          setWaitlistCount(actualCount + WAITLIST_BOOST);
        }
      } catch (error) {
        console.error("IndexPage: Error in waitlist count fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistCount();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 gradient-bg mt-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="rounded-full bg-primary/20 p-4 inline-flex mb-8">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text whitespace-nowrap leading-tight">
              Meet people you vibe with in your city
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground">
              Twyne gets to know your personality, energy, interests, and life context—then introduces you to people nearby who actually click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user ? (
                <Button asChild size="lg" className="rounded-full px-8 hover-scale">
                  <Link to="/connections" className="flex items-center">
                    View Your Connections
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col items-center">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 hover-scale"
                    onClick={() => setIsWaitlistOpen(true)}
                  >
                    Join Waitlist
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                  
                  {!isLoading && waitlistCount !== null && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground mt-3">
                      <Users size={18} className="mr-2 text-primary" />
                      <span>{waitlistCount.toLocaleString()}+ people already on the waitlist</span>
                    </div>
                  )}
                </div>
              )}
              <Button variant="outline" size="lg" className="rounded-full px-8 glass-effect" onClick={scrollToHowItWorks}>
                Learn More
              </Button>
            </div>
            
            {/* Rotating text with reduced spacing */}
            <div className="mt-6 w-full mb-1"> {/* Further reduced space above and below */}
              <RotatingUseScenarios />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Our AI-powered approach to building real connections</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Chat with Twyne</h3>
              <p className="text-muted-foreground">
                Have natural conversations with our AI that learns your vibe, interests, and values.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Local Connections</h3>
              <p className="text-muted-foreground">
                Get introduced to 1-2 people in your city who genuinely share your energy and interests.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect Your Way</h3>
              <p className="text-muted-foreground">
                You decide how things unfold—from a chill convo to a real-world hang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Warm Intros Section */}
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
                onClick={() => setIsWaitlistOpen(true)}
                variant="default" 
                size="sm"
                className="rounded-full w-full md:w-auto self-end mb-6 hover:shadow-md transition-all"
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
                onClick={() => setIsWaitlistOpen(true)}
                variant="default" 
                size="sm"
                className="rounded-full w-full md:w-auto self-end mb-6 hover:shadow-md transition-all"
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
                onClick={() => setIsWaitlistOpen(true)}
                variant="default" 
                size="sm"
                className="rounded-full w-full md:w-auto self-end mb-6 hover:shadow-md transition-all"
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
                onClick={() => setIsWaitlistOpen(true)}
                variant="default" 
                size="sm"
                className="rounded-full w-full md:w-auto self-end mb-6 hover:shadow-md transition-all"
              >
                <MessageCircle size={16} className="mr-1" />
                Connect & Say Hi
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Profile Section */}
      <SampleProfileSection />

      {/* Social Proof Section */}
      <section className="py-16 bg-muted/20">
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
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
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
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
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
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <StarHalf className="h-5 w-5" />
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

      {/* Call to Action */}
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 md:p-12 border border-white/20 shadow-sm">
            <div className="flex flex-col items-center text-center gap-4">
              <Share2 className="h-12 w-12 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Ready to find your authentic connections?</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Join the waitlist today and be first to discover people in your city who truly match your vibe.
              </p>
              <Button 
                onClick={() => setIsWaitlistOpen(true)} 
                className="mt-4 rounded-full px-8 hover-scale" 
                size="lg"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form Modal */}
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </div>
  );
};

export default Index;
