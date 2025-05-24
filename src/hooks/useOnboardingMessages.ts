
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
      // Get AI response from the API
      const aiResponse = await getAIResponse(draftConversation);
      
      // Add AI message to the UI
      const newAiMessage: Message = {
        id: messages.length + 2, // +2 because user message was +1
        text: aiResponse,
        sender: "ai"
      };
      
      setMessages(prev => [...prev, newAiMessage]);
      
      // Update conversation state with AI response
      setConversation({
        messages: [
          ...draftConversation.messages,
          { role: "assistant", content: aiResponse }
        ],
        userAnswers: draftConversation.userAnswers
      });
      
      // Check for possible name in the first user message
      if (currentQuestionIndex === 0 && !userName) {
        extractUserName(userText);
      }
      
      // Also check AI's response for name recognition like "Nice to meet you, [name]"
      if (!userName) {
        checkAIResponseForName(aiResponse);
      }
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
    } finally {
      setIsTyping(false);
    }
  };
  
  // Try to extract name from user's first message
  const extractUserName = (text: string) => {
    // Simple name extraction - look for common patterns
    const patterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1];
        
        // Capitalize first letter
        const formattedName = extractedName.charAt(0).toUpperCase() + 
                              extractedName.slice(1).toLowerCase();

        setUserName(formattedName);
        onNameChange(formattedName);
        break;
      }
    }
  };
  
  // Check AI's response for possible name recognition
  const checkAIResponseForName = (aiResponse: string) => {
    // Look for patterns like "Nice to meet you, [Name]" or "Hi, [Name]!"
    const namePatterns = [
      /nice to meet you,?\s+(\w+)[!.]/i,
      /hi,?\s+(\w+)[!.]/i,
      /hello,?\s+(\w+)[!.]/i,
      /hey,?\s+(\w+)[!.]/i
    ];
    
    for (const pattern of namePatterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1];
        
        // Filter out common English words that might be false positives
        const commonWords = ["there", "friend", "buddy", "pal", "folks", "everyone", "guys"];
        if (commonWords.includes(extractedName.toLowerCase())) {
          continue;
        }
        
        // Capitalize first letter and handle the rest
        const formattedName = extractedName.charAt(0).toUpperCase() + 
                              extractedName.slice(1).toLowerCase();
        
        setUserName(formattedName);
        onNameChange(formattedName);
        break;
      }
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
