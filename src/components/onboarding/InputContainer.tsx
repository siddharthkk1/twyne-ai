
import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickActionButtons from "./QuickActionButtons";
import TextInput from "./TextInput";
import VoiceInput from "./VoiceInput";
import SmsInput from "./SmsInput";

interface InputContainerProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (message?: string) => void;
  conversationMode: string;
  setConversationMode: (value: any) => void;
  showModeSelection: boolean;
  showPromptSelection: boolean;
  setShowPromptSelection: (value: boolean) => void;
  promptMode: string;
  handlePromptModeChange: (mode: any) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSmsVerified: boolean;
  getProgress: () => number;
  handleModeSelection: (mode: any, phoneNumber?: string) => void;
  showCreateAccountPrompt: boolean;
  setShowCreateAccountPrompt: (value: boolean) => void;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (value: boolean) => void;
  startSmsConversation: (phoneNumber: string) => void;
  disabled: boolean;
}

const InputContainer = ({
  input,
  setInput,
  onSend,
  conversationMode,
  setConversationMode,
  showModeSelection,
  showPromptSelection,
  setShowPromptSelection,
  promptMode,
  handlePromptModeChange,
  phoneNumber,
  setPhoneNumber,
  isSmsVerified,
  getProgress,
  handleModeSelection,
  showCreateAccountPrompt,
  setShowCreateAccountPrompt,
  showGuidanceInfo,
  setShowGuidanceInfo,
  startSmsConversation,
  disabled
}: InputContainerProps) => {
  
  // Helper functions for mode switching
  const switchToVoiceMode = () => setConversationMode("voice");
  const switchToTextMode = () => setConversationMode("text");

  const handleHelpClick = () => {
    setShowGuidanceInfo(!showGuidanceInfo);
  };

  return (
    <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto">
        {/* Quick Action Buttons moved above the input */}
        <QuickActionButtons 
          handleSend={onSend} 
          isDisabled={disabled}
        />
        
        {/* Input Field and Send Button */}
        <div className="flex items-end space-x-2">
          {conversationMode === "text" ? (
            <TextInput 
              input={input}
              setInput={setInput}
              handleSend={onSend}
              isDisabled={disabled}
              switchToVoiceMode={switchToVoiceMode}
            />
          ) : conversationMode === "voice" ? (
            <VoiceInput 
              isListening={false}
              toggleVoiceInput={() => {}}
              isDisabled={disabled}
              isProcessing={false}
              switchToTextMode={switchToTextMode}
            />
          ) : (
            <SmsInput 
              phoneNumber={phoneNumber}
              isDisabled={disabled}
              switchToTextMode={switchToTextMode}
            />
          )}
        </div>
        
        {/* Show guidance toggle reminder */}
        <div className="mt-3 text-center">
          <Button 
            variant="link" 
            size="sm" 
            className={`text-xs ${
              showGuidanceInfo 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={handleHelpClick}
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Need help? How this conversation works
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputContainer;
