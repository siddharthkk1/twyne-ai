
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import PromptModeSelector from "./PromptModeSelector";
import InputContainer from "./InputContainer";
import ConversationHeader from "./ConversationHeader";
import { Message } from "@/types/chat";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  isInitializing?: boolean;
  isGeneratingProfile: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
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
  scrollViewportRef: React.RefObject<HTMLDivElement>;
  dashboardRef?: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  resetScrollState: () => void;
  handleMessagePartVisible: () => void;
}

const ChatContainer = ({
  messages,
  input,
  setInput,
  isTyping,
  isInitializing = false,
  isGeneratingProfile,
  messagesEndRef,
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
  scrollViewportRef,
  dashboardRef,
  handleScroll,
  resetScrollState,
  handleMessagePartVisible
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-screen">
      <ConversationHeader
        isGeneratingProfile={isGeneratingProfile}
        progress={getProgress()}
        setShowGuidanceInfo={setShowGuidanceInfo}
        showGuidanceInfo={showGuidanceInfo}
      />
      
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
          
          {/* Show typing indicator or profile generation indicator */}
          {(isTyping || isGeneratingProfile) && !isInitializing && (
            <div>
              <TypingIndicator />
              {isGeneratingProfile && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Generating your mirror...
                </div>
              )}
              <div className="h-16" />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
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
      </ScrollArea>
    </div>
  );
};

export default ChatContainer;
