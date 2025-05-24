import React, { useEffect, useState } from "react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import GuidanceInfo from "@/components/onboarding/GuidanceInfo";
import ConversationHeader from "@/components/onboarding/ConversationHeader";
import LoadingScreen from "@/components/onboarding/LoadingScreen";
import ConversationModeSelector from "@/components/onboarding/ConversationModeSelector";
import { ProfileCompletionDashboard } from "@/pages/Dashboard";
import ChatContainer from "@/components/onboarding/ChatContainer";
import NameCollectionStep from "@/components/onboarding/NameCollectionStep";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    setUserName,
    showNameCollection,
    handleNameSubmit,
    scrollViewportRef,
    dashboardRef,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Show help dialog if not already shown
  useEffect(() => {
    const helpDialogShown = sessionStorage.getItem("helpDialogShown") === "true";
    if (!showNameCollection && userName && !showHelpDialog && !helpDialogShown && messages.length <= 1) {
      const timer = setTimeout(() => {
        setShowHelpDialog(true);
        sessionStorage.setItem("helpDialogShown", "true");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showNameCollection, userName, showHelpDialog, messages.length]);

  useEffect(() => {
    if (isComplete && dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isComplete, dashboardRef]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <CreateAccountPrompt open={showCreateAccountPrompt} onOpenChange={setShowCreateAccountPrompt} />

      {showNameCollection && (
        <div className="flex-1 flex items-center justify-center">
          <NameCollectionStep onSubmit={handleNameSubmit} />
        </div>
      )}

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="sr-only">How This Conversation Works</DialogTitle>
          <div className="space-y-4 py-2">
            <h2 className="text-xl font-semibold">How This Conversation Works</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>This is <span className="font-medium text-foreground">private</span> — just between you and Twyne.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>You'll decide later what (if anything) gets shared with others.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Not sure about something? It's totally fine to say "idk," "skip," or ask to talk about something else.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>What you choose to go into (or not) helps Twyne get your vibe — no pressure either way.</span>
              </p>
            </div>
            <div className="pt-4">
              <Button onClick={() => setShowHelpDialog(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GuidanceInfo showGuidanceInfo={showGuidanceInfo} setShowGuidanceInfo={setShowGuidanceInfo} />

      {(!showNameCollection && !showModeSelection) ? (
        !isComplete ? (
          <>
            <ConversationHeader
              isGeneratingProfile={isGeneratingProfile}
              progress={getProgress()}
              setShowGuidanceInfo={setShowGuidanceInfo}
              showGuidanceInfo={showGuidanceInfo}
            />
            <ChatContainer
              messages={messages}
              input={input}
              setInput={setInput}
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
              conversationMode={conversationMode}
              handleSend={handleSend}
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
          <div ref={dashboardRef} className="flex-1 p-4 scroll-smooth">
            <ProfileCompletionDashboard userProfile={userProfile} />
          </div>
        )
      ) : showModeSelection ? (
        <ConversationModeSelector handleModeSelection={handleModeSelection} />
      ) : null}
    </div>
  );
};

export default OnboardingChat;