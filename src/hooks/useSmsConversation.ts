
import { useState } from 'react';
import { getAIResponse } from '@/utils/aiUtils';
import { Message, Conversation, ChatRole } from '@/types/chat';

export const useSmsConversation = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  // Function to handle SMS response
  const handleSmsResponse = async (
    userText: string,
    draftConversation: Conversation,
    currentConversation: Conversation,
    setMessages: (messages: Message[]) => void,
    setConversation: (conversation: Conversation) => void,
    setIsTyping: (isTyping: boolean) => void,
    phoneNumber: string
  ) => {
    try {
      // Get AI response from the API
      const aiResponse = await getAIResponse(draftConversation);
      
      // Add AI message to the UI
      const newAiMessage: Message = {
        id: Date.now(), // Unique ID
        text: aiResponse,
        sender: "ai"
      };
      
      setMessages(prev => [...prev, newAiMessage]);
      
      // Update conversation state with AI response
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant" as ChatRole, content: aiResponse }
        ],
        userAnswers: draftConversation.userAnswers
      });
    } catch (error) {
      console.error("Error getting AI response for SMS:", error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I couldn't process your message. Please try again.",
        sender: "ai"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to start SMS conversation
  const startSmsConversation = async (
    phoneNumber: string,
    setIsSmsVerified: (isVerified: boolean) => void
  ) => {
    try {
      setIsVerifying(true);
      
      // Make API call to start SMS conversation
      const response = await fetch('/api/start-sms-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start SMS conversation');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIsSmsVerified(true);
        return true;
      } else {
        throw new Error(data.error || 'Failed to verify phone number');
      }
    } catch (error) {
      console.error("Error starting SMS conversation:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return {
    handleSmsResponse,
    startSmsConversation,
    isVerifying
  };
};
