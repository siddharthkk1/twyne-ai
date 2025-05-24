
import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickActionButtons from "./QuickActionButtons";
import TextInput from "./TextInput";
import VoiceInput from "./VoiceInput";
import SmsInput from "./SmsInput";

interface InputContainerProps {
  conversationMode: string;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isDisabled: boolean;
  switchToVoiceMode: () => void;
  switchToTextMode: () => void;
  isListening?: boolean;
  toggleVoiceInput?: () => void;
  isProcessing?: boolean;
  phoneNumber?: string;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (value: boolean) => void;
}

const InputContainer = ({
  conversationMode,
  input,
  setInput,
  handleSend,
  isDisabled,
  switchToVoiceMode,
  switchToTextMode,
  isListening = false,
  toggleVoiceInput = () => {},
  isProcessing = false,
  phoneNumber = "",
  showGuidanceInfo,
  setShowGuidanceInfo
}: InputContainerProps) => {
  return (
    <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto">
        {/* Quick Action Buttons moved above the input */}
        <QuickActionButtons 
          handleSend={handleSend} 
          isDisabled={isDisabled}
        />
        
        {/* Input Field and Send Button */}
        <div className="flex items-end space-x-2">
          {conversationMode === "text" ? (
            <TextInput 
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              isDisabled={isDisabled}
              switchToVoiceMode={switchToVoiceMode}
            />
          ) : conversationMode === "voice" ? (
            <VoiceInput 
              isListening={isListening}
              toggleVoiceInput={toggleVoiceInput}
              isDisabled={isDisabled}
              isProcessing={isProcessing}
              switchToTextMode={switchToTextMode}
            />
          ) : (
            <SmsInput 
              phoneNumber={phoneNumber}
              isDisabled={isDisabled}
              switchToTextMode={switchToTextMode}
            />
          )}
        </div>
        
        {/* Show guidance toggle reminder */}
        {!showGuidanceInfo && (
          <div className="mt-3 text-center">
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowGuidanceInfo(true)}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Need help? How this conversation works
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputContainer;
