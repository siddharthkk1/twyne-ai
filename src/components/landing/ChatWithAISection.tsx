import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

// Define updated conversation snapshots with proper typing and more natural back-and-forth
const conversationSnapshots: Message[][] = [
  // Updated first conversation - Values/personality with more back-and-forth
  [
    {
      id: 1,
      text: "If you could have dinner with anyone, living or dead, who would it be?",
      sender: "ai"
    },
    {
      id: 2,
      text: "Definitely Anthony Bourdain. I've always admired how he connected with people through food and storytelling.",
      sender: "user"
    },
    {
      id: 3,
      text: "That's interesting! What draws you to Bourdain specifically? Is it his approach to travel, storytelling, or something else?",
      sender: "ai"
    },
    {
      id: 4,
      text: "His genuine curiosity about people's lives. He never approached cultures as a tourist, but as someone trying to understand the human experience.",
      sender: "user"
    },
    {
      id: 5,
      text: "It sounds like authentic connections are important to you. Do you find yourself bringing that same curiosity to your own relationships?",
      sender: "ai"
    },
    {
      id: 6,
      text: "I try to. I think that's what makes relationships meaningful - taking the time to really understand someone's perspective rather than just making small talk.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's a thoughtful approach. What other qualities do you think are essential for building meaningful connections with others?",
      sender: "ai"
    },
    {
      id: 8,
      text: "Empathy is crucial. And being willing to be a bit vulnerable yourself - that's how you build trust and depth in relationships.",
      sender: "user"
    },
    {
      id: 9,
      text: "I couldn't agree more. Has there been a time when being vulnerable with someone strengthened your connection with them?",
      sender: "ai"
    },
    {
      id: 10,
      text: "After my dad got sick, I opened up to a colleague about it. Turned out they went through something similar. We've been close friends ever since. That vulnerability created a bond stronger than years of small talk could.",
      sender: "user"
    },
    {
      id: 11,
      text: "Thank you for sharing that. Those moments of connection through shared experiences can be transformative. What would you say you learned from that experience?",
      sender: "ai"
    }
  ],
  // Updated Music conversation - Cultural interests with more questions and interaction
  [
    {
      id: 1,
      text: "What kind of music have you been enjoying lately?",
      sender: "ai"
    },
    {
      id: 2,
      text: "Lately I've been obsessed with Billie Eilish's new album. Her sound has really evolved since her early work.",
      sender: "user"
    },
    {
      id: 3,
      text: "Oh nice! Do you prefer her more introspective ballads or her more experimental tracks?",
      sender: "ai"
    },
    {
      id: 4,
      text: "Definitely her ballads. The vulnerability in her voice on the slower tracks just hits differently. 'When The Party's Over' is still one of my all-time favorites.",
      sender: "user"
    },
    {
      id: 5,
      text: "That's a beautiful track. Do you play any instruments yourself or create music in any way?",
      sender: "ai"
    },
    {
      id: 6,
      text: "I played piano for about 8 years growing up. I don't practice regularly anymore, but I still sit down and play occasionally when I'm feeling stressed.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's wonderful! What kind of music do you enjoy playing when you're at the piano?",
      sender: "ai"
    },
    {
      id: 8,
      text: "Mostly classical pieces I learned years ago - some Chopin nocturnes and a few Bach preludes. I find them meditative and they help clear my mind.",
      sender: "user"
    },
    {
      id: 9,
      text: "Music as meditation is powerful. Does this meditative quality affect how you connect with people who share your musical interests?",
      sender: "ai"
    },
    {
      id: 10,
      text: "Absolutely. When I meet someone who also plays piano or appreciates classical music, we instantly have this common language. But it goes deeper than just having the same hobby - it's about understanding why we're drawn to it.",
      sender: "user"
    },
    {
      id: 11,
      text: "That's a beautiful perspective. How do you think your relationship with music has evolved over time?",
      sender: "ai"
    }
  ],
  // Updated deep conversation about values and life goals with more questions
  [
    {
      id: 1,
      text: "When you think about your life five years from now, what would make you feel fulfilled?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I'd like to have found a better work-life balance. Success for me isn't just about career advancement, but having time for the people and activities I care about.",
      sender: "user"
    },
    {
      id: 3,
      text: "That's a thoughtful perspective. What activities or hobbies would you want to have more time for?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I've always wanted to start a community garden project. My grandmother was an avid gardener and taught me everything. When she passed, I realized how much her garden brought people together.",
      sender: "user"
    },
    {
      id: 5,
      text: "That sounds meaningful. Have you taken any steps toward this garden project yet?",
      sender: "ai"
    },
    {
      id: 6,
      text: "I've started researching community plots in my area and joined a few local gardening groups. I'm also taking an urban agriculture workshop next month.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's exciting! What kinds of plants or foods would you want to grow in your community garden?",
      sender: "ai"
    },
    {
      id: 8,
      text: "A mix of vegetables and native flowering plants. I want it to be both productive and beautiful, while supporting local pollinators. And accessible to people of all gardening experience levels.",
      sender: "user"
    },
    {
      id: 9,
      text: "That's a wonderful vision. It sounds like creating spaces that foster both community and connection to nature is important to you. What other community-focused values do you hold?",
      sender: "ai"
    },
    {
      id: 10,
      text: "I believe in creating spaces where people can genuinely connect across different backgrounds and generations. My grandmother's garden did that naturally - neighbors who might never talk otherwise would stop by and chat while she worked.",
      sender: "user"
    },
    {
      id: 11,
      text: "That's a beautiful example of how shared spaces can bridge divides. What do you think made your grandmother's garden so successful as a community connector?",
      sender: "ai"
    }
  ],
  // Updated travel conversation with more questions and dialogue
  [
    {
      id: 1,
      text: "If you could travel anywhere in the world tomorrow, where would you go?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I've always dreamed of visiting Japan, especially during cherry blossom season. I'm fascinated by the blend of ancient traditions and cutting-edge technology there.",
      sender: "user"
    },
    {
      id: 3,
      text: "Japan would be amazing! What specific regions or experiences would be on your must-see list?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I definitely want to experience Tokyo, but I'm also drawn to less touristy places like the rural villages in Hokkaido and the art islands like Naoshima.",
      sender: "user"
    },
    {
      id: 5,
      text: "That's a great mix of urban and rural experiences. Have you been learning any Japanese to prepare for your dream trip?",
      sender: "ai"
    },
    {
      id: 6,
      text: "Yes! I've been using Duolingo for basic phrases and watching travel documentaries. I'm also taking a Japanese cooking class next month.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's wonderful preparation! What Japanese dishes have you enjoyed making or would like to learn?",
      sender: "ai"
    },
    {
      id: 8,
      text: "I've gotten pretty good at making ramen from scratch, and I'm working on perfecting tamago kake gohan. Next up is learning to make proper dashi for miso soup.",
      sender: "user"
    },
    {
      id: 9,
      text: "Those are fantastic dishes to learn! Do you find that exploring cultures through their food helps you connect more deeply when you travel?",
      sender: "ai"
    },
    {
      id: 10,
      text: "Absolutely. Food is such a universal language. I've had some amazing conversations with locals just by showing interest in their cuisine. It's often the quickest way past the tourist-local barrier.",
      sender: "user"
    },
    {
      id: 11,
      text: "That's so true. What's been your most meaningful travel experience so far, where food helped create a connection?",
      sender: "ai"
    }
  ]
];

export const ChatWithAISection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>(conversationSnapshots[0]);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [hasScrollContent, setHasScrollContent] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [api, setApi] = useState<any>(null);
  
  // Animation effect for element appearance
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Effect to update messages when snapshot index changes manually
  useEffect(() => {
    // Only fade out the chat element
    setIsVisible(false);
    
    // After a short delay, change the messages and fade them back in
    const timeout = setTimeout(() => {
      setMessages(conversationSnapshots[currentSnapshotIndex]);
      setIsVisible(true);
      setHasScrollContent(true);
      
      // Reset scroll position to top when changing conversations
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = 0;
        }
      }
    }, 150); // Short transition time
    
    return () => clearTimeout(timeout);
  }, [currentSnapshotIndex]);

  // Handle scroll event to determine if at bottom
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        // Check if scrolled to bottom (or nearly)
        const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 5;
        setHasScrollContent(!isAtBottom);
      }
    }
  };

  const handleNextProfile = () => {
    if (api && api.canScrollNext()) {
      api.scrollNext();
      // Let the API's select event handle the index update
    }
  };

  const handlePrevProfile = () => {
    if (api && api.canScrollPrev()) {
      api.scrollPrev();
      // Let the API's select event handle the index update
    }
  };

  // Update current snapshot index when carousel changes
  React.useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrentSnapshotIndex(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How We Get to Know You</h2>
          <p className="text-muted-foreground mt-2">Through conversations that feel refreshingly human</p>
        </div>

        <div className="grid md:grid-cols-2 gap-0 md:gap-2 items-center">
          {/* Text content with improved organization - narrower and left-aligned */}
          <div className="space-y-5 max-w-sm">
            <p className="text-lg font-medium text-left">
              Twyne's AI learns your personality, interests, and what matters to you—creating 
              a nuanced picture of who you are.
            </p>
            
            <h3 className="font-medium text-primary text-left">How it works:</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center justify-center mr-3 h-7 w-7 rounded-full bg-primary/20 flex-shrink-0">
                  <span className="text-primary text-xs font-medium leading-none">1</span>
                </div>
                <p className="text-sm">Share your interests, values, and what you're looking for in connections</p>
              </div>
              <div className="flex items-start">
                <div className="flex items-center justify-center mr-3 h-7 w-7 rounded-full bg-primary/20 flex-shrink-0">
                  <span className="text-primary text-xs font-medium leading-none">2</span>
                </div>
                <p className="text-sm">Our AI builds a deeper understanding of your vibe than profiles ever could</p>
              </div>
              <div className="flex items-start">
                <div className="flex items-center justify-center mr-3 h-7 w-7 rounded-full bg-primary/20 flex-shrink-0">
                  <span className="text-primary text-xs font-medium leading-none">3</span>
                </div>
                <p className="text-sm">No awkward bios or curated photos—just authentic conversations</p>
              </div>
              <div className="flex items-start">
                <div className="flex items-center justify-center mr-3 h-7 w-7 rounded-full bg-primary/20 flex-shrink-0">
                  <span className="text-primary text-xs font-medium leading-none">4</span>
                </div>
                <p className="text-sm">You choose what information can be shared with others during warm intros and connections</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                className="rounded-full px-8 hover-scale"
                onClick={() => setIsWaitlistOpen(true)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Try It Now
              </Button>
            </div>
          </div>
          
          {/* Chat simulation with improved scrolling and carousel behavior */}
          <div className="flex flex-col items-center w-full md:pl-0">
            <div className="relative w-full max-w-md mx-auto">
              <Carousel 
                className="w-full"
                setApi={setApi}
                opts={{
                  align: "center",
                  loop: false,
                }}
                orientation="horizontal"
              >
                <CarouselContent>
                  {conversationSnapshots.map((snapshot, index) => (
                    <CarouselItem key={index} className="w-full">
                      <div 
                        className={`bg-background rounded-2xl shadow-lg p-6 border border-border/50 transition-opacity duration-150 w-full relative ${
                          isVisible && currentSnapshotIndex === index ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <MessageCircle className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-medium">Chat with Twyne</h3>
                          </div>
                        </div>
                        
                        {/* Scroll container with improved scrolling behavior */}
                        <div className="relative">
                          <ScrollArea 
                            ref={scrollAreaRef} 
                            className="h-[320px] pr-2 overflow-visible w-full"
                            onScrollCapture={handleScroll}
                          >
                            <div className="space-y-4 mb-4 w-full">
                              {conversationSnapshots[currentSnapshotIndex].map((message) => (
                                <div
                                  key={`${currentSnapshotIndex}-${message.id}`}
                                  className={`animate-fade-in ${
                                    message.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                                  }`}
                                >
                                  {message.text}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                          
                          {/* Combined arrow indicator and gradient fade overlay */}
                          {hasScrollContent && (
                            <>
                              {/* Arrow indicator with circular background */}
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                                <div className="bg-primary/70 rounded-full p-2">
                                  <ArrowDown className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              {/* Gradient fade */}
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                            </>
                          )}
                        </div>
                        
                        <div className="bg-muted/40 rounded-full px-4 py-3 flex items-center mt-4">
                          <input 
                            type="text" 
                            placeholder="Tell me more about yourself..."
                            className="bg-transparent flex-1 outline-none text-sm border-none focus:ring-0 shadow-none"
                            disabled
                          />
                          <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M22 2L11 13"></path>
                              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Custom navigation controls for both mobile and desktop */}
              <div className="flex items-center justify-between mt-6">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={handlePrevProfile}
                  disabled={!api?.canScrollPrev()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous conversation</span>
                </Button>
              
                <div className="flex justify-center space-x-3">
                  {conversationSnapshots.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        if (api) {
                          api.scrollTo(index);
                          setCurrentSnapshotIndex(index);
                        }
                      }}
                      className={`h-3 w-3 rounded-full transition-all ${
                        currentSnapshotIndex === index ? 'bg-primary scale-125' : 'bg-muted'
                      }`}
                      aria-label={`View conversation ${index + 1}`}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={handleNextProfile}
                  disabled={!api?.canScrollNext()}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next conversation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the WaitlistForm modal */}
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>
  );
};
