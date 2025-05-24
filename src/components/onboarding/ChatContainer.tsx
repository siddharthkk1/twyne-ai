import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import PromptModeSelector from "./PromptModeSelector";
import { Message } from "@/types/chat";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  isInitializing?: boolean;
  isGeneratingProfile: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  getNameInitial: () => string;
  handleMessagePartVisible: () => void;
  scrollViewportRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  promptMode: string;
  handlePromptModeChange: (mode: any) => void;
  userName: string;
  conversationMode: string;
  handleSend: (message?: string) => void;
  switchToVoiceMode: () => void;
  switchToTextMode: () => void;
  isListening: boolean;
  toggleVoiceInput: () => void;
  isProcessing: boolean;
  phoneNumber: string;
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: (v: boolean) => void;
}

const ChatContainer = ({
  messages,
  input,
  setInput,
  isTyping,
  isInitializing = false,
  isGeneratingProfile,
  messagesEndRef,
  getNameInitial,
  handleMessagePartVisible,
  scrollViewportRef,
  handleScroll,
  promptMode,
  handlePromptModeChange,
  userName,
  handleSend
}: ChatContainerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [messages]);

  return (
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

        {isTyping && !isInitializing && (
          <div>
            <TypingIndicator />
            <div className="h-16" />
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
              placeholder="Say something..."
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={`rounded-full p-2 transition-colors ${input.trim() ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChatContainer;