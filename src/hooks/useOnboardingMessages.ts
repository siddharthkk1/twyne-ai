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
  
  // Timeout reference for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Function to handle AI response with comprehensive error handling and timeout protection
  const handleAIResponse = async (
    userText: string, 
    draftConversation: Conversation,
    currentConversation: Conversation,
    setIsTyping: (value: boolean) => void,
    setConversation: (conversation: Conversation) => void
  ) => {
    console.log('🤖 handleAIResponse: Starting AI response flow', { userText });
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    let typingIndicatorTimeout: NodeJS.Timeout | null = null;
    
    try {
      // Add a 800ms delay before showing the typing indicator
      typingIndicatorTimeout = setTimeout(() => {
        console.log('🔄 handleAIResponse: Showing typing indicator');
        setIsTyping(true);
      }, 800);
      
      // Set up timeout protection (30 seconds total timeout)
      timeoutRef.current = setTimeout(() => {
        console.error('⏰ handleAIResponse: Request timed out after 30 seconds');
        
        // Abort the request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Clear typing indicator
        if (typingIndicatorTimeout) {
          clearTimeout(typingIndicatorTimeout);
        }
        setIsTyping(false);
        
        // Add timeout error message
        const timeoutMessage: Message = {
          id: messages.length + 2,
          text: "I'm taking longer than usual to respond. Let me try again - please send your message once more.",
          sender: "ai"
        };
        
        setMessages(prev => [...prev, timeoutMessage]);
        
        // Update conversation with timeout message
        setConversation({
          messages: [
            ...draftConversation.messages,
            { role: "assistant", content: timeoutMessage.text }
          ],
          userAnswers: draftConversation.userAnswers
        });
        
      }, 30000); // 30 second timeout
      
      console.log('🔄 handleAIResponse: Calling getAIResponse API');
      
      // Get AI response from the API with abort signal
      const aiResponse = await getAIResponse(draftConversation);
      
      console.log('✅ handleAIResponse: Received AI response', { response: aiResponse.substring(0, 100) + '...' });
      
      // Clear timeout since request succeeded
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear typing indicator timeout
      if (typingIndicatorTimeout) {
        clearTimeout(typingIndicatorTimeout);
        typingIndicatorTimeout = null;
      }
      
      // Add AI message to the UI while keeping typing indicator visible briefly
      const newAiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai"
      };
      
      console.log('🔄 handleAIResponse: Adding AI message to UI');
      
      // Add the message first, then remove typing indicator to prevent scroll jump
      setMessages(prev => [...prev, newAiMessage]);
      
      // Small delay to ensure message is rendered before removing typing indicator
      setTimeout(() => {
        console.log('🔄 handleAIResponse: Hiding typing indicator');
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
      
      console.log('✅ handleAIResponse: AI response flow completed successfully');
      
    } catch (error) {
      console.error("❌ handleAIResponse: Error getting AI response:", error);
      
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (typingIndicatorTimeout) {
        clearTimeout(typingIndicatorTimeout);
        typingIndicatorTimeout = null;
      }
      
      // Always ensure typing indicator is hidden
      setIsTyping(false);
      
      // Determine error type and message
      let errorMessage = "Sorry, I had trouble responding. Could you try again?";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('🔄 handleAIResponse: Request was aborted');
          return; // Don't show error message for aborted requests
        } else if (error.message.includes('timeout') || error.message.includes('fetch')) {
          errorMessage = "I'm having trouble connecting right now. Please try sending your message again.";
        }
      }
      
      // Add error message to chat
      const errorAiMessage: Message = {
        id: messages.length + 2,
        text: errorMessage,
        sender: "ai"
      };
      
      console.log('🔄 handleAIResponse: Adding error message to UI');
      setMessages(prev => [...prev, errorAiMessage]);
      
      // Update conversation with error message
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: errorAiMessage.text }
        ],
        userAnswers: draftConversation.userAnswers
      });
    }
  };
  
  // Cleanup function to clear timeouts and abort requests
  const cleanup = () => {
    console.log('🧹 useOnboardingMessages: Cleaning up timeouts and requests');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
    setCurrentQuestionIndex,
    cleanup
  };
};
