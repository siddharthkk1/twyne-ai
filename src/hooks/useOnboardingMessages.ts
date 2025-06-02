import { useState, useRef } from 'react';
import { Message, Conversation } from '@/types/chat';
import { getAIResponse } from '@/utils/aiUtils';

export const useOnboardingMessages = (
  onNameChange: (name: string) => void,
  messageCap: number
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Function to handle AI response
  const handleAIResponse = async (
    userText: string, 
    draftConversation: Conversation,
    currentConversation: Conversation,
    setIsTyping: (value: boolean) => void,
    setConversation: (conversation: Conversation) => void
  ) => {
    try {
      // Add a 800ms delay before showing the typing indicator
      setTimeout(() => {
        setIsTyping(true);
      }, 800);
      
      // Get AI response from the API
      const aiResponse = await getAIResponse(draftConversation);
      
      // Add AI message to the UI while keeping typing indicator visible briefly
      const newAiMessage: Message = {
        id: messages.length + 2, // +2 because user message was +1
        text: aiResponse,
        sender: "ai"
      };
      
      // Add the message first, then remove typing indicator to prevent scroll jump
      setMessages(prev => [...prev, newAiMessage]);
      
      // Small delay to ensure message is rendered before removing typing indicator
      setTimeout(() => {
        setIsTyping(false);
      }, 50);
      
      // Update conversation state with AI response
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: aiResponse }
        ],
        userAnswers: draftConversation.userAnswers
      });
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2, // +2 because user message was +1
        text: "Sorry, I had trouble responding. Could you try again?",
        sender: "ai"
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Update conversation with error message
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: errorMessage.text }
        ],
        userAnswers: draftConversation.userAnswers
      });
      
      setIsTyping(false);
    }
  };
  
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
