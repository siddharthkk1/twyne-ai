
import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
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

const OnboardingChat = () => {
  const {
    messages,
    input,
    setInput,
    isComplete,
    isTyping,
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
    phoneNumber,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend
  } = useOnboardingChat();

  const { isListening, isProcessing, toggleVoiceInput } = useVoiceRecording(handleSend);

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
          
          {/* Chat content - added padding-top to avoid overlap with fixed header */}
          <div className="flex-1 p-4 pt-24 overflow-y-auto">
            <div className="space-y-4 pb-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id}
                  message={message} 
                  nameInitial={getNameInitial()} 
                />
              ))}
              {isTyping && <TypingIndicator />}
              {isGeneratingProfile && <LoadingScreen />}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0">
            <div className="max-w-3xl mx-auto">
              {/* Quick Action Buttons moved above the input */}
              <QuickActionButtons 
                handleSend={handleSend} 
                isDisabled={isTyping || isGeneratingProfile}
              />
              
              {/* Input Field and Send Button - Now with SMS Option */}
              <div className="flex items-end space-x-2">
                {conversationMode === "text" ? (
                  <TextInput 
                    input={input}
                    setInput={setInput}
                    handleSend={() => handleSend()}
                    isDisabled={isTyping || isGeneratingProfile}
                    switchToVoiceMode={() => setConversationMode("voice")}
                  />
                ) : conversationMode === "voice" ? (
                  <VoiceInput 
                    isListening={isListening}
                    toggleVoiceInput={toggleVoiceInput}
                    isDisabled={isTyping || isGeneratingProfile}
                    isProcessing={isProcessing}
                    switchToTextMode={() => setConversationMode("text")}
                  />
                ) : (
                  <SmsInput 
                    phoneNumber={phoneNumber}
                    isDisabled={isTyping || isGeneratingProfile}
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
          <div className="flex-1">
            <ProfileCompletionDashboard userProfile={userProfile} />
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingChat;
