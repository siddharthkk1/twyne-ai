
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import GuidanceInfo from "@/components/onboarding/GuidanceInfo";
import ConversationHeader from "@/components/onboarding/ConversationHeader";
import MessageBubble from "@/components/onboarding/MessageBubble";
import TypingIndicator from "@/components/onboarding/TypingIndicator";
import LoadingScreen from "@/components/onboarding/LoadingScreen";
import QuickActionButtons from "@/components/onboarding/QuickActionButtons";
import TextInput from "@/components/onboarding/TextInput";
import VoiceInput from "@/components/onboarding/VoiceInput";
import SmsInput from "@/components/onboarding/SmsInput";
import ConversationModeSelector from "@/components/onboarding/ConversationModeSelector";
import PromptModeSelector from "@/components/onboarding/PromptModeSelector";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { ScrollArea } from "@/components/ui/scroll-area";

const OnboardingChat = () => {
  const {
    messages,
    input,
    setInput,
    isComplete,
    isTyping,
    isInitializing,
    isGeneratingProfile,
    userProfile,
    messagesEndRef,
    showCreateAccountPrompt,
    setShowCreateAccountPrompt,
    showGuidanceInfo,
    setShowGuidanceInfo,
    conversationMode,
    setConversationMode,
    showModeSelection,
    promptMode,
    handlePromptModeChange,
    phoneNumber,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);

  // Add a ref for the ScrollArea viewport
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  // Force scroll to bottom whenever a new message is added or typing status changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollViewportRef.current) {
        const scrollElement = scrollViewportRef.current;
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    };

    // Immediate scroll attempt
    scrollToBottom();

    // Also schedule a delayed scroll to handle any render delays
    const timer = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping]);
  
  // Additional scroll effect when messages change
  useEffect(() => {
    // Extra timed scrolls for when content might be delayed in rendering
    const timers = [
      setTimeout(() => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
      }, 200),
      setTimeout(() => {
        if (scrollViewportRef.current) {
          scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
        }
      }, 500)
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [messages.length]); // Only depend on message count for this one

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <CreateAccountPrompt open={showCreateAccountPrompt} onOpenChange={setShowCreateAccountPrompt} />
      <GuidanceInfo showGuidanceInfo={showGuidanceInfo} setShowGuidanceInfo={setShowGuidanceInfo} />
      
      {showModeSelection ? (
        <ConversationModeSelector handleModeSelection={handleModeSelection} />
      ) : !isComplete ? (
        <>
          {/* Fixed header with back button and progress indicator */}
          <ConversationHeader 
            isGeneratingProfile={isGeneratingProfile}
            progress={getProgress()}
            setShowGuidanceInfo={setShowGuidanceInfo}
            showGuidanceInfo={showGuidanceInfo}
          />
          
          {/* Chat content with ScrollArea */}
          <ScrollArea 
            className="flex-1 p-4 pt-24" 
            viewportRef={scrollViewportRef}
            onViewportScroll={() => console.log("Viewport scrolled")}
          >
            <div className="space-y-4 pb-4 max-w-3xl mx-auto">
              {/* Prompt Mode Selector */}
              <div className="flex justify-end mb-2">
                <PromptModeSelector 
                  promptMode={promptMode} 
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
                    />
                  ))}
                </>
              )}
              
              {isTyping && !isInitializing && <TypingIndicator />}
              {isGeneratingProfile && <LoadingScreen />}
              <div ref={messagesEndRef}></div>
            </div>
          </ScrollArea>

          <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0">
            <div className="max-w-3xl mx-auto">
              {/* Quick Action Buttons moved above the input */}
              <QuickActionButtons 
                handleSend={handleSend} 
                isDisabled={isTyping || isGeneratingProfile || isInitializing}
              />
              
              {/* Input Field and Send Button */}
              <div className="flex items-end space-x-2">
                {conversationMode === "text" ? (
                  <TextInput 
                    input={input}
                    setInput={setInput}
                    handleSend={() => handleSend()}
                    isDisabled={isTyping || isGeneratingProfile || isInitializing}
                    switchToVoiceMode={() => setConversationMode("voice")}
                  />
                ) : conversationMode === "voice" ? (
                  <VoiceInput 
                    isListening={isListening}
                    toggleVoiceInput={toggleVoiceInput}
                    isDisabled={isTyping || isGeneratingProfile || isInitializing}
                    isProcessing={isProcessing}
                    switchToTextMode={() => setConversationMode("text")}
                  />
                ) : (
                  <SmsInput 
                    phoneNumber={phoneNumber}
                    isDisabled={isTyping || isGeneratingProfile || isInitializing}
                    switchToTextMode={() => setConversationMode("text")}
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
        </>
      ) : (
        <>          
          <div className="flex-1 p-4">
            <ProfileCompletionDashboard 
              userProfile={userProfile} 
            />
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingChat;
