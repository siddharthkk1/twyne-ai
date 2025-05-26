
import React from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import PromptModeSelector from "./PromptModeSelector";
import InputContainer from "./InputContainer";
import ConversationHeader from "./ConversationHeader";
import GuidanceInfo from "./GuidanceInfo";
import { Message } from "@/types/chat";
import { Loader } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  isInitializing?: boolean;
  isGeneratingProfile: boolean;
  showCreateAccountPrompt: boolean;
  setShowCreateAccountPrompt: (value: boolean) => void;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (value: boolean) => void;
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
  getNameInitial: () => string;
  onSend: (message?: string) => void;
  startSmsConversation: (phoneNumber: string) => void;
  userName: string;
  setUserName: (value: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  handleAIMessagePart: (updateMessages: () => void) => void;
  isScrolling?: boolean;
}

const ChatContainer = ({
  messages,
  input,
  setInput,
  isTyping,
  isInitializing = false,
  isGeneratingProfile,
  showCreateAccountPrompt,
  setShowCreateAccountPrompt,
  showGuidanceInfo,
  setShowGuidanceInfo,
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
  getNameInitial,
  onSend,
  startSmsConversation,
  userName,
  setUserName,
  scrollContainerRef,
  handleScroll,
  handleAIMessagePart
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-screen">
      <ConversationHeader
        isGeneratingProfile={isGeneratingProfile}
        progress={getProgress()}
        setShowGuidanceInfo={setShowGuidanceInfo}
        showGuidanceInfo={showGuidanceInfo}
      />
      
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pt-4 max-w-3xl mx-auto w-full scrollbar-none chat-scroll-container"
      >
        <div className="space-y-4 pt-8 pb-4 max-w-3xl mx-auto">
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
                  onMessagePartVisible={handleAIMessagePart}
                  userName={userName}
                />
              ))}
              
              {/* Show typing indicator when AI is thinking */}
              {isTyping && !isGeneratingProfile && (
                <TypingIndicator />
              )}
            </>
          )}
          
          {/* Show typing indicator or profile generation indicator */}
          {isGeneratingProfile && !isInitializing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="relative">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="h-4 w-4 bg-background rounded-full block"></span>
                </div>
              </div>
              <h2 className="text-xl font-medium">Generating your insights</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Building your personal insights based on our conversation. This helps Twyne match you with meaningful connections.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-4 w-full max-w-3xl mx-auto">
        <InputContainer
          input={input}
          setInput={setInput}
          onSend={onSend}
          conversationMode={conversationMode}
          setConversationMode={setConversationMode}
          showModeSelection={showModeSelection}
          showPromptSelection={showPromptSelection}
          setShowPromptSelection={setShowPromptSelection}
          promptMode={promptMode}
          handlePromptModeChange={handlePromptModeChange}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isSmsVerified={isSmsVerified}
          getProgress={getProgress}
          handleModeSelection={handleModeSelection}
          showCreateAccountPrompt={showCreateAccountPrompt}
          setShowCreateAccountPrompt={setShowCreateAccountPrompt}
          showGuidanceInfo={showGuidanceInfo}
          setShowGuidanceInfo={setShowGuidanceInfo}
          startSmsConversation={startSmsConversation}
          disabled={isTyping || isGeneratingProfile}
        />
      </div>
      
      {/* Guidance Info Popup */}
      <GuidanceInfo 
        showGuidanceInfo={showGuidanceInfo}
        setShowGuidanceInfo={setShowGuidanceInfo}
      />
    </div>
  );
};

export default ChatContainer;
