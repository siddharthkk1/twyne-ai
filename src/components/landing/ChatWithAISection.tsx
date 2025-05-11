
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

// Define multiple conversation snapshots with proper typing
const conversationSnapshots: Message[][] = [
  // Hiking and game nights conversation
  [
    {
      id: 1,
      text: "Hey there! I'm Twyne. I'd love to get to know you better. What kinds of things do you enjoy doing on weekends?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I love hiking and trying new restaurants. Sometimes I host game nights with friends too.",
      sender: "user"
    },
    {
      id: 3,
      text: "That sounds great! I'm a fan of hiking too. Any favorite trails or national parks you've been to? And what type of games do you usually play on your game nights?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I recently hiked at Redwood National Park. For game nights, we play everything from Catan to Cards Against Humanity. Depends on the mood!",
      sender: "user"
    },
    {
      id: 5,
      text: "Redwood is stunning! Those ancient trees are something else. And your game nights sound like the perfect mix of strategy and laughs. You seem like someone who values both outdoor adventures and quality time with friends. What kind of restaurants do you enjoy exploring?",
      sender: "ai"
    },
  ],
  // Music conversation - starting mid-conversation
  [
    {
      id: 1,
      text: "So what kind of music are you into these days?",
      sender: "ai"
    },
    {
      id: 2,
      text: "Lately I've been obsessed with Billie Eilish's new album. Her sound has really evolved since her early work.",
      sender: "user"
    },
    {
      id: 3,
      text: "Oh yes! Her production with FINNEAS is incredible. 'What Was I Made For' was such a powerful track from the Barbie soundtrack too. Do you prefer her more introspective ballads or her edgier electronic tracks?",
      sender: "ai"
    },
    {
      id: 4,
      text: "Definitely her ballads. The vulnerability in her voice on the slower tracks just hits differently. 'When The Party's Over' is still one of my all-time favorites.",
      sender: "user"
    },
    {
      id: 5,
      text: "That track is a masterpiece! The way she uses silence and space in that song is brilliant. You appreciate emotional depth in music, which says a lot about how you connect with art. Do you play any instruments yourself or is your relationship with music purely as a listener?",
      sender: "ai"
    },
  ],
  // Reading conversation - starting mid-conversation
  [
    {
      id: 1,
      text: "What have you been reading lately that you've really enjoyed?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I just finished 'Tomorrow, and Tomorrow, and Tomorrow' by Gabrielle Zevin. It's about friendship, video games, and creative collaboration. Couldn't put it down!",
      sender: "user"
    },
    {
      id: 3,
      text: "That book was one of my favorites from last year! The way Zevin explores the complex relationship between Sam and Sadie through decades is so nuanced. Did you have a favorite timeline or game they created in the story?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I loved 'Solution,' the game where you're just trying to help someone across a river. The simplicity yet meaning behind it was powerful. Also enjoyed the entire MIT era of their friendship.",
      sender: "user"
    },
    {
      id: 5,
      text: "Yes! Solution was such a beautiful metaphor in the book. Your connection to both the simple, meaningful game and the formative college years suggests you value authentic connections and creative problem-solving. Have you read any of Emily St. John Mandel's work? I think her narrative style might resonate with you.",
      sender: "ai"
    },
  ]
];

export const ChatWithAISection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>(conversationSnapshots[0]);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  // Animation effect for element appearance
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Effect to rotate through conversation snapshots
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSnapshotIndex((prevIndex) => 
        (prevIndex + 1) % conversationSnapshots.length
      );
    }, 8000); // Change conversation every 8 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update messages when snapshot index changes
  useEffect(() => {
    // First fade out messages
    setIsVisible(false);
    
    // After a short delay, change the messages and fade them back in
    const timeout = setTimeout(() => {
      setMessages(conversationSnapshots[currentSnapshotIndex]);
      setIsVisible(true);
    }, 200); // Reduced from 300ms to 200ms for less animation delay
    
    return () => clearTimeout(timeout);
  }, [currentSnapshotIndex]);

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Our AI Gets to Know You</h2>
          <p className="text-muted-foreground mt-2">Through natural conversations that feel refreshingly human</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text content - Updated font styles to match the rest of the page */}
          <div 
            className={`space-y-6 transition-opacity duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="text-lg text-foreground">
              Through natural conversations, Twyne's AI learns your personality, interests,
              and what matters to you—creating a nuanced picture of who you are.
            </p>
            <div className="space-y-3 text-foreground">
              <div className="flex items-start">
                <div className="mr-3 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm font-medium">1</span>
                </div>
                <p>Chat naturally—share your interests, values, and what you're looking for</p>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm font-medium">2</span>
                </div>
                <p>Our AI builds a deeper understanding of your vibe than traditional profiles ever could</p>
              </div>
              <div className="flex items-start">
                <div className="mr-3 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <span className="text-primary text-sm font-medium">3</span>
                </div>
                <p>No awkward bios or curated photos—just authentic conversations</p>
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
          
          {/* Chat simulation - Reduced transform animation for smoother transitions */}
          <div 
            className={`bg-background rounded-2xl shadow-lg p-6 border border-border/50 transition-opacity duration-500 ${
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
              {/* Removed the 3 dots as requested */}
            </div>
            
            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
              {messages.map((message) => (
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
            
            {/* Conversation switcher dots */}
            <div className="flex justify-center mt-4 space-x-2">
              {conversationSnapshots.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSnapshotIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentSnapshotIndex === index ? 'bg-primary scale-125' : 'bg-muted'
                  }`}
                  aria-label={`View conversation ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
      
      {/* Add the WaitlistForm modal */}
      <WaitlistForm open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>
  );
};

