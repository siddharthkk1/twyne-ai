
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";

export type ConversationModeType = "text" | "voice" | "sms";

export const useConversationMode = () => {
  const [conversationMode, setConversationMode] = useState<ConversationModeType>("text");
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSmsVerified, setIsSmsVerified] = useState(false);

  // Function to handle conversation mode selection (text, voice, or sms)
  const handleModeSelection = (mode: ConversationModeType, phoneNumberInput?: string) => {
    setConversationMode(mode);
    
    if (mode === "sms" && phoneNumberInput) {
      setPhoneNumber(phoneNumberInput);
      
      // In a real implementation, we would verify the phone number here
      // and send an initial message to start the conversation
      toast({
        title: "SMS conversation started",
        description: `We've sent an initial message to ${phoneNumberInput}. Reply to continue the conversation.`,
      });
    }
    
    setShowModeSelection(false);
  };

  // New function to handle SMS verification
  const startSmsConversation = async (phoneNumberInput: string) => {
    try {
      // In a real implementation, this would:
      // 1. Validate the phone number format
      // 2. Send a verification code via SMS
      // 3. Wait for the user to enter the code
      // 4. Start the conversation
      
      // For now, we'll simulate success
      setPhoneNumber(phoneNumberInput);
      setIsSmsVerified(true);
      setConversationMode("sms");
      setShowModeSelection(false);
      
      toast({
        title: "SMS conversation started",
        description: "You can now continue the conversation via SMS. Replies will appear here as well.",
      });
    } catch (error) {
      console.error("Error starting SMS conversation:", error);
      
      toast({
        title: "Error",
        description: "Failed to start SMS conversation. Please try again or choose a different option.",
        variant: "destructive",
      });
    }
  };

  return {
    conversationMode,
    setConversationMode,
    showModeSelection,
    setShowModeSelection,
    phoneNumber,
    setPhoneNumber,
    isSmsVerified,
    handleModeSelection,
    startSmsConversation,
  };
};
