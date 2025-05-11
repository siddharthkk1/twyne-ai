
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

// Define multiple conversation snapshots
const conversationSnapshots = [
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
  // Music and travel conversation
  [
    {
      id: 1,
      text: "Hi there! I'd love to get to know you better. What are you passionate about these days?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I've been really into music production lately, and I'm planning a trip to Japan next year.",
      sender: "user"
    },
    {
      id: 3,
      text: "Music production sounds fascinating! What kind of music do you make? And Japan is an amazing destination - which cities are you hoping to visit?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I produce electronic music with some jazz influences. For Japan, definitely Tokyo and Kyoto, but I'd love to explore some lesser-known areas too.",
      sender: "user"
    },
    {
      id: 5,
      text: "That's such a cool fusion of genres! And your travel style sounds perfect - balancing the must-see spots with authentic local experiences shows you're thoughtful and adventurous. Have you picked up any Japanese phrases yet?",
      sender: "ai"
    },
  ],
  // Reading and cooking conversation
  [
    {
      id: 1,
      text: "Hello! I'm Twyne. I'd like to get to know you a bit. What do you enjoy doing in your free time?",
      sender: "ai"
    },
    {
      id: 2,
      text: "I read a lot of science fiction and I've been getting into cooking lately. Been trying to perfect my pasta-making skills.",
      sender: "user"
    },
    {
      id: 3,
      text: "Science fiction and homemade pasta? That's a fantastic combination! Who are some of your favorite sci-fi authors? And how's the pasta-making journey going?",
      sender: "ai"
    },
    {
      id: 4,
      text: "I love Octavia Butler and Ted Chiang. My pasta is getting better! Made a decent fettuccine last weekend, but ravioli is still challenging.",
      sender: "user"
    },
    {
      id: 5,
      text: "Octavia Butler's work is incredible, and Ted Chiang's short stories are so thought-provoking! Your pasta adventure sounds rewarding - starting with fettuccine before tackling ravioli shows you're methodical. Do you have a signature sauce to pair with your handmade pasta?",
      sender: "ai"
    },
  ]
];

export const ChatWithAISection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>(conversationSnapshots[0]);
  
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
    }, 300); // This delay should be shorter than the interval above
    
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
          {/* Text content */}
          <div 
            className={`space-y-6 transition-all duration-700 transform ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[-20px] opacity-0'
            }`}
          >
            <p className="text-lg text-muted-foreground">
              Through natural conversations, Twyne's AI learns your personality, interests,
              and what matters to you—creating a nuanced picture of who you are.
            </p>
            <div className="space-y-3 text-muted-foreground">
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
                onClick={() => window.location.href = "/onboarding"}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Try It Now
              </Button>
            </div>
          </div>
          
          {/* Chat simulation */}
          <div 
            className={`bg-background rounded-2xl shadow-lg p-6 border border-border/50 transition-all duration-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Chat with Twyne</h3>
              </div>
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-muted"></div>
                <div className="h-2 w-2 rounded-full bg-muted"></div>
              </div>
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
    </section>
  );
};
