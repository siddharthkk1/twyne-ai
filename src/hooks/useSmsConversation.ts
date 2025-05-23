
import { Conversation } from '@/types/chat';
import { getAIResponse } from '@/utils/aiUtils';
import { toast } from "@/components/ui/use-toast";

export const useSmsConversation = () => {
  // Handling SMS response
  const handleSmsResponse = async (
    userMessage: string, 
    draftConversation: Conversation,
    conversation: Conversation,
    setMessages: Function,
    setConversation: Function,
    setIsTyping: Function,
    phoneNumber: string
  ) => {
    try {
      // In a real implementation, this would call the SMS edge function
      console.log(`Would send SMS to ${phoneNumber} with message: ${userMessage}`);
      
      // For the demo, we'll simulate the SMS flow with the regular AI response
      // Update: Call getAIResponse with only the conversation parameter
      const aiResponse = await getAIResponse(conversation);
      
      // Log the simulated SMS response
      console.log(`Would receive SMS response: ${aiResponse}`);
      
      // Update UI as if we got the response via SMS
      const newAiMessage = {
        id: Date.now(),
        text: aiResponse,
        sender: "ai" as const,
      };

      const updatedConversation = {
        messages: [
          ...conversation.messages,
          { role: "user" as const, content: userMessage },
          { role: "assistant" as const, content: aiResponse }
        ],
        userAnswers: [...conversation.userAnswers, userMessage]
      };

      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      setIsTyping(false);
      
    } catch (error) {
      console.error("Error in SMS conversation:", error);
      setIsTyping(false);
      
      // Show error toast
      toast({
        title: "SMS service error",
        description: "We encountered an issue with the SMS service. Please try again or choose a different conversation mode.",
        variant: "destructive",
      });
    }
  };

  return {
    handleSmsResponse
  };
};
