
import { useState, useCallback } from 'react';
import { Message, Conversation, ChatRole } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingMessages = (
  updateUserName: (name: string) => void,
  messageCap: number
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleAIResponse = useCallback(async (
    userMessage: string,
    draftConversation: Conversation,
    currentConversation: Conversation,
    setIsTyping: (typing: boolean) => void,
    setConversation: (conv: Conversation) => void
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: draftConversation.messages }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        setIsTyping(false);
        return;
      }

      const aiResponse = data.response;
      
      // Replace the typing indicator with the actual AI message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.sender !== "typing");
        return [...withoutTyping, {
          id: prev.length + 1,
          text: aiResponse,
          sender: "ai" as const
        }];
      });

      const assistantMessageObj: { role: ChatRole; content: string } = {
        role: "assistant" as ChatRole,
        content: aiResponse
      };

      const finalConversation = {
        messages: [...draftConversation.messages, assistantMessageObj],
        userAnswers: draftConversation.userAnswers
      };

      setConversation(finalConversation);
      setIsTyping(false);

    } catch (error) {
      console.error('Unexpected error in AI response:', error);
      setIsTyping(false);
    }
  }, []);

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
