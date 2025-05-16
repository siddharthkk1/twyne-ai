
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IoCheckmark
} from "react-icons/io5";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

// Define multiple conversation snapshots with proper typing
const conversationSnapshots: Message[][] = [
  // Travel conversation - Japan - Higher to deeper level
  [
    {
      id: 1,
      text: "If you could travel anywhere tomorrow, where would you go?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I've always wanted to visit Japan, especially during cherry blossom season. I'm fascinated by the blend of ancient traditions and modern technology there.",
      sender: "user"
    },
    {
      id: 3,
      text: "Japan sounds wonderful! What aspects of Japanese culture are you most interested in experiencing?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I'm really drawn to the food culture and the concept of wabi-sabi - finding beauty in imperfection. I'd love to explore rural villages in Hokkaido and art islands like Naoshima.",
      sender: "user"
    },
    {
      id: 5,
      text: "That's fascinating. How do you usually approach visiting new places - do you prefer planning everything or leaving room for spontaneous discoveries?",
      sender: "ai"
    },
    {
      id: 6,
      text: "I like having a loose framework but leaving plenty of room for wandering. Some of my best travel memories are from getting lost and stumbling upon unexpected places.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's a beautiful approach. What would you hope to learn about yourself through immersing in a culture so different from your own?",
      sender: "ai"
    }
  ],
  // Values conversation - Garden project - Medium level depth
  [
    {
      id: 1,
      text: "When you think about your life five years from now, what would make you feel fulfilled?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I'd like to have found a better work-life balance. Success for me isn't just about career advancement, but having time for the people and activities that bring me joy.",
      sender: "user"
    },
    {
      id: 3,
      text: "That's a thoughtful perspective. What kinds of activities or relationships do you find most meaningful outside of work?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I've been thinking about starting a community garden project. My grandmother was an avid gardener and taught me everything. It brought people together in a really special way.",
      sender: "user"
    },
    {
      id: 5,
      text: "That sounds like a meaningful project. What aspects of community gardening appeal to you most - is it the gardening itself, the community building, or something else?",
      sender: "ai"
    },
    {
      id: 6,
      text: "It's definitely a blend of both. There's something therapeutic about working with your hands in the soil, but watching neighbors become friends over shared harvests is the real magic.",
      sender: "user"
    },
    {
      id: 7,
      text: "I love how you see that connection between nature and human relationships. What's one challenge you anticipate in starting this project, and how might you approach it?",
      sender: "ai"
    }
  ],
  // Music conversation - Moving from casual to deeper insights
  [
    {
      id: 1,
      text: "What kind of music do you enjoy listening to these days?",
      sender: "ai"
    },
    {
      id: 2,
      text: "Lately I've been obsessed with Billie Eilish's new album. Her sound has really evolved since her early work.",
      sender: "user"
    },
    {
      id: 3,
      text: "I've heard her music has changed quite a bit! What do you appreciate most about her evolution as an artist?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I love how she's gotten more vulnerable in her lyrics while experimenting with new sounds. 'When The Party's Over' is still one of my all-time favorites.",
      sender: "user"
    },
    {
      id: 5,
      text: "That's a beautiful track. Do you generally connect more with lyrics or with the musical composition when you listen to songs?",
      sender: "ai"
    },
    {
      id: 6,
      text: "It's the lyrics first, definitely. I need to feel like the artist is telling a truth that resonates with me. But the right melody can make those lyrics hit so much harder.",
      sender: "user"
    },
    {
      id: 7,
      text: "That makes sense. Has a particular song ever changed your perspective or helped you through a difficult time? What was it about that music that reached you?",
      sender: "ai"
    }
  ],
  // Dinner conversation - Deep, personal exploration
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
      text: "That's interesting! What about him or his approach to connecting with others resonates with you?",
      sender: "ai"
    },
    {
      id: 4,
      text: "His genuine curiosity about people's lives and stories. He never approached cultures as a tourist, but as someone trying to understand the human experience.",
      sender: "user"
    },
    {
      id: 5,
      text: "Thanks for sharing that. It sounds like authenticity and genuine connections matter to you. What other qualities do you value in your relationships?",
      sender: "ai"
    },
    {
      id: 6,
      text: "I think it's about presence - really listening rather than just waiting to speak. And vulnerability - being willing to share the messy parts of yourself, not just the highlights reel.",
      sender: "user"
    },
    {
      id: 7,
      text: "That's profound. When was the last time you felt truly understood by someone? What made that interaction different from others?",
      sender: "ai"
    }
  ]
];

export const ChatWithAISection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>(conversationSnapshots[0]);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [hasScrollContent, setHasScrollContent] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobileView = useIsMobile();
  const [api, setApi] = useState<CarouselApi | null>(null);
  
  // Animation effect for element appearance
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle scroll to control the gradient indicator visibility
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        // Check if scrolled to bottom (or nearly)
        const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 20;
        setHasScrollContent(!isAtBottom);
      }
    }
  };

  // Handle carousel slide change
  const handleSlideChange = (index: number) => {
    if (index < 0) {
      index = conversationSnapshots.length - 1;
    } else if (index >= conversationSnapshots.length) {
      index = 0;
    }
    
    setActiveIndex(index);
    
    // Fade out the chat element
    setIsVisible(false);
    
    // After a short delay, change the messages and fade them back in
    setTimeout(() => {
      setMessages(conversationSnapshots[index]);
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
  };

  // Handle carousel API changes
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
      handleSlideChange(api.selectedScrollSnap());
    };
    
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How We Get to Know You</h2>
          <p className="text-muted-foreground mt-2">Through conversations that feel refreshingly human</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
          {/* Text content - Width reduced by 15% */}
          <div className="space-y-6 w-full max-w-[450px] mb-8 md:mb-0">
            <p className="text-lg">
              Twyne's AI learns your personality, interests, and what matters to you—creating 
              a nuanced picture of who you are.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">Share your interests, values, life story, and what you're looking for</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">Our AI builds a deeper understanding of your vibe than profiles ever could</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">No awkward bios or curated photos—just authentic conversations</p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 flex-shrink-0 aspect-square rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <IoCheckmark className="text-primary text-[14px]" />
                </div>
                <p className="ml-3">You choose what information can be shared with others</p>
              </div>
            </div>
            <div>
              <Button 
                className="rounded-full px-8 hover-scale"
                onClick={() => setIsWaitlistOpen(true)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Try It Now
              </Button>
            </div>
          </div>
          
          {/* Chat simulation with carousel */}
          <div className="flex flex-col items-center w-full max-w-[600px]">
            <Carousel 
              className="w-full" 
              setApi={setApi}
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent>
                {conversationSnapshots.map((snapshot, index) => (
                  <CarouselItem key={index} className="flex justify-center">
                    <div 
                      className={`bg-background rounded-2xl shadow-lg p-6 border border-border/50 transition-opacity duration-150 w-full relative ${
                        isVisible ? 'opacity-100' : 'opacity-0'
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
                      
                      {/* Scroll container with gradient fade and scroll arrow at the bottom */}
                      <div className="relative">
                        <ScrollArea 
                          ref={scrollAreaRef} 
                          className={`pr-2 overflow-visible ${isMobileView ? "h-[375px]" : "h-[300px]"}`}
                          onScrollCapture={handleScroll}
                        >
                          <div className="space-y-4 mb-4">
                            {messages.map((message) => (
                              <div
                                key={`${index}-${message.id}`}
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
            
            {/* Conversation navigation controls (dots and arrows) */}
            <div className="flex justify-center items-center mt-6 space-x-8">
              {/* Left arrow button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-primary/10"
                onClick={() => handleSlideChange(activeIndex - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots */}
              <div className="flex space-x-3">
                {conversationSnapshots.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      handleSlideChange(index);
                      api?.scrollTo(index);
                    }}
                    className={`h-3 w-3 rounded-full transition-all ${
                      activeIndex === index ? 'bg-primary scale-125' : 'bg-muted'
                    }`}
                    aria-label={`View conversation ${index + 1}`}
                  />
                ))}
              </div>

              {/* Right arrow button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-primary/10"
                onClick={() => handleSlideChange(activeIndex + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add the WaitlistForm modal */}
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>
  );
};

