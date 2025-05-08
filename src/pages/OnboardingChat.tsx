
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hey there 👋 I'm Twyne. I'm here to help you meet people you'll really click with.",
    sender: "ai",
  },
  {
    id: 2,
    text: "Let's chat for a bit so I can understand your vibe. What's your first name?",
    sender: "ai",
  },
];

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    "Great to meet you! What city do you live in?",
    "What are 2-3 things you love doing in your free time?",
    "What's something you're curious about or want to learn more about?",
    "What kind of connections are you hoping to make here?",
    "Do you prefer meeting new people one-on-one or in small groups?",
    "Thanks for sharing! Based on what you've told me, I think you'll meet some great people here. I'll start looking for connections in your area that match your vibe.",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      if (currentStep < questions.length) {
        const newAiMessage: Message = {
          id: messages.length + 2,
          text: questions[currentStep],
          sender: "ai",
        };
        setMessages((prev) => [...prev, newAiMessage]);
        setIsTyping(false);
        setCurrentStep(currentStep + 1);

        // Complete onboarding after the last question
        if (currentStep === questions.length - 1) {
          setTimeout(() => {
            setIsComplete(true);
          }, 1500);
        }
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-xl font-medium text-center">Chat with Twyne</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-fade-in ${
                message.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-ai animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {isComplete ? (
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="text-center mb-4">
            <h2 className="text-lg font-medium">Profile Created!</h2>
            <p className="text-muted-foreground">
              I'll notify you when I find people you might click with.
            </p>
          </div>
          <Button asChild className="w-full rounded-full">
            <Link to="/connections">See Your Connections</Link>
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="rounded-full"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="rounded-full"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
