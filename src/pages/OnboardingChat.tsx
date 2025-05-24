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
import InputContainer from "@/components/onboarding/InputContainer";
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
    scrollViewportRef,
    dashboardRef,
    handleScroll,
    handleMessagePartVisible
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);

  const [showNameCollectionStep, setShowNameCollectionStep] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  useEffect(() => {
    if (!showCreateAccountPrompt && !userName) {
      setShowNameCollectionStep(true);
    }
  }, [showCreateAccountPrompt, userName]);

  useEffect(() => {
    const helpDialogShown = sessionStorage.getItem("helpDialogShown") === "true";
    if (!showNameCollectionStep && userName && !showHelpDialog && !helpDialogShown && messages.length <= 1) {
      const timer = setTimeout(() => {
        setShowHelpDialog(true);
        sessionStorage.setItem("helpDialogShown", "true");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showNameCollectionStep, userName, showHelpDialog, messages.length]);

  const handleNameSubmission = (name: string) => {
    setUserName(name);
    setShowNameCollectionStep(false);
  };

  const handleCloseHelpDialog = () => {
    setShowHelpDialog(false);
    setShowGuidanceInfo(false);
    sessionStorage.setItem("helpDialogShown", "true");
  };

  useEffect(() => {
    if (!scrollViewportRef.current || isComplete) return;
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
    resizeObserver.observe(scrollViewportRef.current);
    mutationObserver.observe(scrollViewportRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isComplete, messages.length, handleMessagePartVisible, scrollViewportRef]);

  useEffect(() => {
    if (isComplete && dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isComplete, dashboardRef]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <CreateAccountPrompt open={showCreateAccountPrompt} onOpenChange={setShowCreateAccountPrompt} />

      {showNameCollectionStep && (
        <div className="flex-1 flex items-center justify-center">
          <NameCollectionStep onSubmit={handleNameSubmission} />
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
              <Button onClick={handleCloseHelpDialog} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GuidanceInfo showGuidanceInfo={showGuidanceInfo} setShowGuidanceInfo={setShowGuidanceInfo} />

      {(!showNameCollectionStep && !showModeSelection) ? (
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
