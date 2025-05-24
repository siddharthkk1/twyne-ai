import React, { useEffect } from "react";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import LoadingScreen from "@/components/onboarding/LoadingScreen";
import ChatContainer from "@/components/onboarding/ChatContainer";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import NameCollectionStep from "@/components/onboarding/NameCollectionStep";

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
    handleSend,
    startSmsConversation,
    userName,
    setUserName,
    showNameCollection,
    handleNameSubmit,
    scrollViewportRef,
    dashboardRef,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  } = useOnboardingChat();

  useEffect(() => {
    const scrollEl = scrollViewportRef.current;
    const endEl = messagesEndRef.current;
    if (!scrollEl || !endEl) return;

    const isAtBottom =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 100;

    if (isAtBottom) {
      requestAnimationFrame(() => {
        endEl.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [messages.length]);

  if (showNameCollection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <NameCollectionStep onSubmit={handleNameSubmit} />
      </div>
    );
  }

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
        <div className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
          <ProfileCompletionDashboard
            userProfile={userProfile}
            userName={userName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        isTyping={isTyping}
        isInitializing={isInitializing}
        isGeneratingProfile={isGeneratingProfile}
        messagesEndRef={messagesEndRef}
        scrollViewportRef={scrollViewportRef}
        handleScroll={handleScroll}
        getNameInitial={getNameInitial}
        handleMessagePartVisible={handleMessagePartVisible}
        promptMode={promptMode}
        handlePromptModeChange={handlePromptModeChange}
        userName={userName}
        conversationMode={conversationMode}
        setConversationMode={setConversationMode}
        showModeSelection={showModeSelection}
        showPromptSelection={showPromptSelection}
        setShowPromptSelection={setShowPromptSelection}
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
        onSend={handleSend}
        disabled={isTyping || isGeneratingProfile}
      />
    </div>
  );
};

export default OnboardingChat;