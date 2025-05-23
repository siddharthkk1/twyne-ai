
import { useState, useEffect } from 'react';
import { Message, ChatRole } from '@/types/chat';
import { toast } from "@/components/ui/use-toast";
import { getAIResponse } from '@/utils/aiUtils';

export const useOnboardingMessages = (
  onCompleteOnboarding: (userName: string) => void, 
  MESSAGE_CAP = 20
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Handle sending messages and getting AI responses
  const handleAIResponse = async (
    textToSend: string,
    draftConversation: any,
    conversation: any,
    setIsTyping: (value: boolean) => void,
    setConversation: (value: any) => void
  ) => {
    try {
      // Get AI response
      const aiResponse = await getAIResponse(conversation, textToSend);
      
      // Add error checking for empty or invalid responses
      if (!aiResponse || aiResponse.trim() === "") {
        console.error("Empty AI response received");
        setIsTyping(false);
        toast({
          title: "Connection issue",
          description: "We're having trouble connecting to our AI. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const newAiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
      };

      const updatedConversation = {
        messages: [
          ...conversation.messages,
          { role: "user" as ChatRole, content: textToSend },
          { role: "assistant" as ChatRole, content: aiResponse }
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };

      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      setIsTyping(false);
      
      return { message: newAiMessage, conversation: updatedConversation };
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setIsTyping(false);
      
      const fallbackResponse = "Sorry for the hiccup. Please continue - I'm listening.";
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        text: fallbackResponse,
        sender: "ai"
      };
      
      const updatedConversation = {
        messages: [
          ...conversation.messages,
          { role: "user" as ChatRole, content: textToSend },
          { role: "assistant" as ChatRole, content: fallbackResponse }
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };
      
      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      
      return { message: newAiMessage, conversation: updatedConversation };
    }
  };

  // Detect if we should try to extract the user's name
  useEffect(() => {
    if (currentQuestionIndex === 1 && userName === "") {
      // This is likely the first response from the user, try to extract a name
      const firstUserMessage = messages.find(m => m.sender === "user")?.text || "";
      
      // Simple name extraction - look for common patterns in first message
      const extractName = (text: string): string => {
        // Try different patterns to extract names
        const namePatterns = [
          /(?:^|[^a-zA-Z])(?:I'm|I am|call me|name is|its)\s+([A-Z][a-z]+)/i,
          /^([A-Z][a-z]+)(?:\s|$)/,  // Just a name at start of message
          /^Hi[,.!]?\s+(?:I'm|I am)?\s*([A-Z][a-z]+)/i  // Hi, I'm Name
        ];
        
        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
        
        return "";
      };
      
      const extractedName = extractName(firstUserMessage);
      if (extractedName) {
        setUserName(extractedName);
      }
    }
  }, [currentQuestionIndex, userName, messages]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    handleAIResponse,
    userName,
    setUserName,
    currentQuestionIndex,
    setCurrentQuestionIndex
  };
};
