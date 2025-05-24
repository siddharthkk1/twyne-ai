
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import PromptModeSelector from "./PromptModeSelector";
import InputContainer from "./InputContainer";
import { Message } from "@/types/chat";

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  isInitializing: boolean;
  isGeneratingProfile: boolean;
  getNameInitial: () => string;
  handleMessagePartVisible: () => void;
  scrollViewportRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  promptMode: string;
  handlePromptModeChange: (mode: any) => void;
  userName: string;
  // Input container props
  conversationMode: string;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  switchToVoiceMode: () => void;
  switchToTextMode: () => void;
  isListening?: boolean;
  toggleVoiceInput?: () => void;
  isProcessing?: boolean;
  phoneNumber?: string;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (value: boolean) => void;
}

const ChatContainer = ({
  messages,
  isTyping,
  isInitializing,
  isGeneratingProfile,
  getNameInitial,
  handleMessagePartVisible,
  scrollViewportRef,
  handleScroll,
  messagesEndRef,
  promptMode,
  handlePromptModeChange,
  userName,
  conversationMode,
  input,
  setInput,
  handleSend,
  switchToVoiceMode,
  switchToTextMode,
  isListening = false,
  toggleVoiceInput = () => {},
  isProcessing = false,
  phoneNumber = "",
  showGuidanceInfo,
  setShowGuidanceInfo
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea 
        className="flex-1 p-4 pt-24 overflow-hidden" 
        viewportRef={scrollViewportRef}
        onViewportScroll={handleScroll}
      >
        <div className="space-y-4 pb-24 max-w-3xl mx-auto">
          {/* Prompt Mode Selector */}
          <div className="flex justify-end mb-2">
            <PromptModeSelector 
              promptMode={promptMode as any} 
              onPromptModeChange={handlePromptModeChange}
              disabled={messages.length > 0 && !isInitializing}
            />
          </div>
          
          {/* Show initializing state if waiting for AI greeting */}
          {isInitializing ? (
            <div className="flex justify-center my-8">
              <TypingIndicator />
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id}
                  message={message} 
                  nameInitial={getNameInitial()}
                  onMessagePartVisible={handleMessagePartVisible}
                  userName={userName}
                />
              ))}
            </>
          )}
          
          {isTyping && !isInitializing && (
            <div>
              <TypingIndicator />
              {/* Invisible element that helps with scrolling when typing indicator appears */}
              <div className="h-16" />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" /> {/* Add some height to ensure we can scroll past the last message */}
        </div>
      </ScrollArea>

      {/* Input container */}
      <InputContainer 
        conversationMode={conversationMode}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isDisabled={isTyping || isGeneratingProfile || isInitializing}
        switchToVoiceMode={switchToVoiceMode}
        switchToTextMode={switchToTextMode}
        isListening={isListening}
        toggleVoiceInput={toggleVoiceInput}
        isProcessing={isProcessing}
        phoneNumber={phoneNumber}
        showGuidanceInfo={showGuidanceInfo}
        setShowGuidanceInfo={setShowGuidanceInfo}
      />
    </div>
  );
};

export default ChatContainer;
