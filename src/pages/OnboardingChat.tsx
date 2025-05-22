
import React, { useEffect, useRef, useCallback } from "react";
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
    handleSend,
    userName
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);

  // Add a ref for the ScrollArea viewport
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Define a function to scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current) {
      const scrollElement = scrollViewportRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth"
      });
    }
    
    // Also use the messagesEndRef for additional scrolling support
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesEndRef]);

  // Force scroll to bottom whenever a new message is added or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);
  
  // Scroll to top when profile is complete
  useEffect(() => {
    if (isComplete && dashboardRef.current) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [isComplete]);
  
  // Set up a ResizeObserver to handle window and content size changes
  useEffect(() => {
    if (!scrollViewportRef.current || isComplete) return;
    
    // Create both a resize observer and mutation observer
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottom();
    });
    
    const mutationObserver = new MutationObserver(() => {
      scrollToBottom();
    });
    
    // Start observing
    if (scrollViewportRef.current) {
      resizeObserver.observe(scrollViewportRef.current);
      mutationObserver.observe(scrollViewportRef.current, {
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
    
    // Also set up a regular interval to check scroll position
    const scrollInterval = setInterval(scrollToBottom, 1000);
    
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(scrollInterval);
    };
  }, [isComplete, scrollToBottom]);
  
  // Handle scroll to bottom whenever a new message part becomes visible
  const handleMessagePartVisible = useCallback(() => {
    requestAnimationFrame(scrollToBottom);
  }, [scrollToBottom]);

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
            className="flex-1 p-4 pt-24 overflow-hidden" 
            viewportRef={scrollViewportRef}
          >
            <div className="space-y-4 pb-24 max-w-3xl mx-auto">
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
              {isGeneratingProfile && <LoadingScreen />}
              <div ref={messagesEndRef} className="h-4" /> {/* Add some height to ensure we can scroll past the last message */}
            </div>
          </ScrollArea>

          <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0 z-10">
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
                    handleSend={() => {
                      handleSend();
                      // Force scroll to bottom after sending
                      setTimeout(scrollToBottom, 100);
                    }}
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
          <div ref={dashboardRef} className="flex-1 p-4 scroll-smooth">
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
