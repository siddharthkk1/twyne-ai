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
  conversationMode: string;
  setConversationMode: (value: any) => void;
  showModeSelection: boolean;
  showPromptSelection: boolean;
  setShowPromptSelection: (value: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isSmsVerified: boolean;
  getProgress: () => number;
  handleModeSelection: (mode: any, phoneNumber?: string) => void;
  showCreateAccountPrompt: boolean;
  setShowCreateAccountPrompt: (value: boolean) => void;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (value: boolean) => void;
  startSmsConversation: (phone: string) => void;
  onSend: (msg?: string) => void;
  disabled: boolean;
}

const ChatContainer = ({
  messages,
  input,
  setInput,
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
  setConversationMode,
  showModeSelection,
  showPromptSelection,
  setShowPromptSelection,
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
  onSend,
  disabled
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-screen">
      <ConversationHeader
        isGeneratingProfile={isGeneratingProfile}
        progress={getProgress()}
        showGuidanceInfo={showGuidanceInfo}
        setShowGuidanceInfo={setShowGuidanceInfo}
      />

      <ScrollArea
        className="flex-1 p-4 pt-24 overflow-hidden"
        viewportRef={scrollViewportRef}
        onViewportScroll={handleScroll}
      >
        <div className="space-y-4 pb-24 max-w-3xl mx-auto">
          <div className="flex justify-end mb-2">
            <PromptModeSelector
              promptMode={promptMode as any}
              onPromptModeChange={handlePromptModeChange}
              disabled={messages.length > 0 && !isInitializing}
            />
          </div>

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

          {(isTyping || isGeneratingProfile) && !isInitializing && (
            <div>
              <TypingIndicator />
              <div className="h-16" />
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

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
        disabled={disabled}
      />
    </div>
  );
};

export default ChatContainer;