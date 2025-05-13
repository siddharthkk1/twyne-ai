
import React, { useState } from "react";
import { Smile, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// Sample chat messages for the mock conversation
const sampleMessages = [
  {
    role: "ai",
    content: "Hey there! I'm Twyne. I'll help you make local connections with people who share your interests and values.",
  },
  {
    role: "user",
    content: "Hey! I just moved to Austin and I'm looking to meet people who like hiking and board games.",
  },
  {
    role: "ai",
    content: "That's great! Austin has an amazing outdoors scene. What kind of board games are you into? And how long have you been hiking?",
  },
  {
    role: "user",
    content: "I love strategy games like Settlers of Catan and Terraforming Mars. I've been hiking for about 5 years now.",
  },
  {
    role: "ai",
    content: "Perfect! I think you'd really hit it off with Alex. They organize a weekly board game night and they're part of a local hiking group that does weekend trails.",
  },
];

export const ChatWithAISection = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const visibleMessages = sampleMessages.slice(0, currentMessageIndex + 1);
  const totalMessages = sampleMessages.length;
  
  const handleNext = () => {
    if (currentMessageIndex < totalMessages - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    } else {
      setCurrentMessageIndex(0);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center">
          {/* Text content - now taking up less horizontal space */}
          <div className="lg:col-span-5 lg:pr-2">
            <h2 className="text-3xl font-bold mb-4">Let's Chat</h2>
            <p className="text-lg mb-6">
              Our AI gets to know your vibe through natural, friendly conversation—not a boring questionnaire.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Conversational</h3>
                  <p className="text-muted-foreground">
                    It's like chatting with a friend who asks the right questions, not a robotic form.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Insightful</h3>
                  <p className="text-muted-foreground">
                    Our AI finds deeper patterns in your responses to understand what makes you unique.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Personalized</h3>
                  <p className="text-muted-foreground">
                    The more you share, the better we get at finding people who truly match your vibe.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Chat UI - now wider */}
          <div className="lg:col-span-7 lg:pl-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden max-w-lg mx-auto">
              {/* Chat header */}
              <div className="bg-primary px-4 py-3 flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                  T
                </div>
                <div className="ml-3 text-white">
                  <p className="font-medium">Twyne</p>
                  <p className="text-xs text-white/80">AI Friend Maker</p>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="p-4 h-96 overflow-y-auto flex flex-col space-y-3">
                {visibleMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`animate-fade-in ${
                      message.role === "user" ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div 
                      className={`px-4 py-2 rounded-2xl max-w-xs ${
                        message.role === "user" 
                          ? "bg-primary text-white rounded-br-none" 
                          : "bg-slate-100 rounded-bl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation dots */}
              <div className="border-t border-slate-100 p-3 flex items-center justify-between">
                <div className="flex space-x-1">
                  {[...Array(totalMessages)].map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx === currentMessageIndex ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <button 
                  onClick={handleNext}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
