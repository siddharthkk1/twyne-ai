
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

interface UserProfile {
  oneLiner?: string;
  lifePillars?: string[];
  lifestyle?: string;
  socialContext?: string;
  values?: string[];
  otherNotes?: string[];
}

const checkpointPrompts = {
  oneLiner: "What's your one-liner lately? Who are you right now in a sentence or two?",
  lifePillars: "What are the 5 biggest things your life revolves around right now? Could be work, hobbies, anything.",
  lifestyle: "If I followed you for a week, what would I see you doing?",
  socialContext: "What's your social world like these days?",
};

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey there! I'm Twyne, your friendly connection guide. 👋", sender: "ai" },
    { id: 2, text: checkpointPrompts.oneLiner, sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [stepQueue, setStepQueue] = useState<string[]>(["oneLiner", "lifePillars", "lifestyle", "socialContext"]);
  const [currentStep, setCurrentStep] = useState("oneLiner");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    setTimeout(() => {
      processUserResponse(input);
    }, 600);
  };

  const processUserResponse = (response: string) => {
    let updatedProfile = { ...userProfile };
    switch (currentStep) {
      case "oneLiner":
        updatedProfile.oneLiner = response;
        break;
      case "lifePillars":
        updatedProfile.lifePillars = response.split(/,|\n|\s-\s/).map((item) => item.trim()).filter(Boolean);
        break;
      case "lifestyle":
        updatedProfile.lifestyle = response;
        break;
      case "socialContext":
        updatedProfile.socialContext = response;
        break;
      default:
        updatedProfile.otherNotes = [...(updatedProfile.otherNotes || []), response];
        break;
    }
    setUserProfile(updatedProfile);
    continueConversation(updatedProfile);
  };

  const continueConversation = (profile: UserProfile) => {
    const remainingSteps = stepQueue.filter((step) => !profile[step as keyof UserProfile]);
    if (remainingSteps.length > 0) {
      const nextStep = remainingSteps[0];
      setCurrentStep(nextStep);
      sendAiMessage(checkpointPrompts[nextStep as keyof typeof checkpointPrompts]);
    } else {
      // All checkpoints covered – reflect summary
      const summary = generateSummary(profile);
      sendAiMessage(summary);
      markUserAsOnboarded(profile);
    }
  };

  const sendAiMessage = (text: string) => {
    const aiMessage: Message = {
      id: messages.length + 1,
      text,
      sender: "ai",
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const generateSummary = (profile: UserProfile) => {
    let parts: string[] = [];
    if (profile.oneLiner) parts.push(`You're someone who says: "${profile.oneLiner}"`);
    if (profile.lifePillars?.length)
      parts.push(`Your life currently revolves around: ${profile.lifePillars.join(", ")}`);
    if (profile.lifestyle) parts.push(`You spend your time like this: ${profile.lifestyle}`);
    if (profile.socialContext) parts.push(`Socially, you describe your current world as: ${profile.socialContext}`);
    return `${parts.join(". ")}.\nI'll use what I've learned to match you with people you're likely to genuinely vibe with. 💫`;
  };

  const markUserAsOnboarded = async (profile: UserProfile) => {
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { has_onboarded: true, profile_data: profile },
        });
        if (error) {
          toast({
            title: "Error",
            description: "Failed to update your profile.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error updating onboarding status:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4 pb-20">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-0.5 bg-purple-100 border border-purple-200">
                    <AvatarImage src="/lovable-uploads/01b56105-88b1-40dc-b8f9-4ab2f5222a85.png" alt="Twyne" />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.sender === "ai" ? "bg-muted rounded-tl-sm" : "bg-primary text-white rounded-tr-sm"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-0.5 bg-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-0.5 bg-purple-100 border border-purple-200">
                <AvatarImage src="/lovable-uploads/01b56105-88b1-40dc-b8f9-4ab2f5222a85.png" alt="Twyne" />
                <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] bg-muted">
                <div className="flex space-x-2">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="p-4 bg-background/95 backdrop-blur-md border-t">
        <div className="max-w-2xl mx-auto relative">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="pr-12 pl-4 py-6 rounded-full border-muted bg-background shadow-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChat;
