
import React from "react";
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

  // Show name collection step first
  //if (showNameCollection) {
  //  return (
  //    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
  //      <NameCollectionStep onSubmit={handleNameSubmit} />
  //    </div>
  //  );
  //}

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show results when complete
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

  // Show chat interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        isTyping={isTyping}
        isGeneratingProfile={isGeneratingProfile}
        messagesEndRef={messagesEndRef}
        showCreateAccountPrompt={showCreateAccountPrompt}
        setShowCreateAccountPrompt={setShowCreateAccountPrompt}
        showGuidanceInfo={showGuidanceInfo}
        setShowGuidanceInfo={setShowGuidanceInfo}
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
        getNameInitial={getNameInitial}
        onSend={handleSend}
        startSmsConversation={startSmsConversation}
        userName={userName}
        setUserName={setUserName}
        scrollViewportRef={scrollViewportRef}
        dashboardRef={dashboardRef}
        handleScroll={handleScroll}
        resetScrollState={resetScrollState}
        handleMessagePartVisible={handleMessagePartVisible}
      />
    </div>
  );
};

export default OnboardingChat;
