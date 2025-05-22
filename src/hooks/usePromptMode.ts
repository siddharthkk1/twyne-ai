
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

export type PromptModeType = "structured" | "playful" | "young-adult";

export const usePromptMode = () => {
  const [promptMode, setPromptMode] = useState<PromptModeType>("playful"); // Default to playful
  const [showPromptSelection, setShowPromptSelection] = useState(false);

  const handlePromptModeChange = (mode: PromptModeType) => {
    // Only change the prompt mode if we're at the beginning of the conversation
    if (mode !== promptMode) {
      setPromptMode(mode);
      toast({
        title: "Conversation style changed",
        description: `You've switched to ${mode === "structured" ? "Guided Conversation" : mode === "playful" ? "Playful Chat" : "Chill Talk"} mode.`,
        duration: 3000,
      });
    }
  };

  return {
    promptMode,
    setPromptMode,
    showPromptSelection,
    setShowPromptSelection,
    handlePromptModeChange,
  };
};
