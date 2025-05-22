
import React, { useEffect } from "react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import GuidanceInfo from "@/components/onboarding/GuidanceInfo";
import ConversationHeader from "@/components/onboarding/ConversationHeader";
import LoadingScreen from "@/components/onboarding/LoadingScreen";
import ConversationModeSelector from "@/components/onboarding/ConversationModeSelector";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import ChatContainer from "@/components/onboarding/ChatContainer";
import InputContainer from "@/components/onboarding/InputContainer";

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
    userName,
    // Scroll-related
    scrollViewportRef,
    dashboardRef,
    handleScroll,
    handleMessagePartVisible
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);
  
  // Set up a ResizeObserver to handle window and content size changes
  useEffect(() => {
    if (!scrollViewportRef.current || isComplete) return;
    
    // Create both a resize observer and mutation observer
    const resizeObserver = new ResizeObserver(() => {
      if (messages.length > 0) {
        handleMessagePartVisible();
      }
    });
    
    const mutationObserver = new MutationObserver(() => {
      if (messages.length > 0) {
        handleMessagePartVisible();
      }
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
    
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isComplete, messages.length, handleMessagePartVisible, scrollViewportRef]);

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
          
          {/* Chat content */}
          <ChatContainer 
            messages={messages}
            isTyping={isTyping}
            isInitializing={isInitializing}
            isGeneratingProfile={isGeneratingProfile}
            getNameInitial={getNameInitial}
            handleMessagePartVisible={handleMessagePartVisible}
            scrollViewportRef={scrollViewportRef}
            handleScroll={handleScroll}
            messagesEndRef={messagesEndRef}
            promptMode={promptMode}
            handlePromptModeChange={handlePromptModeChange}
            userName={userName}
          />

          {/* Input container */}
          <InputContainer 
            conversationMode={conversationMode}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isDisabled={isTyping || isGeneratingProfile || isInitializing}
            switchToVoiceMode={() => setConversationMode("voice")}
            switchToTextMode={() => setConversationMode("text")}
            isListening={isListening}
            toggleVoiceInput={toggleVoiceInput}
            isProcessing={isProcessing}
            phoneNumber={phoneNumber}
            showGuidanceInfo={showGuidanceInfo}
            setShowGuidanceInfo={setShowGuidanceInfo}
          />
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
