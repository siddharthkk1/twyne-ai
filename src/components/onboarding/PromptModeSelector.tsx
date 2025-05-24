
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromptModeType } from '@/hooks/useOnboardingChat';

interface PromptModeSelectorProps {
  promptMode: PromptModeType;
  onPromptModeChange: (mode: PromptModeType) => void;
  disabled?: boolean;
}

const PromptModeSelector: React.FC<PromptModeSelectorProps> = ({ 
  promptMode, 
  onPromptModeChange,
  disabled = false
}) => {
  const handleValueChange = (value: string) => {
    onPromptModeChange(value as PromptModeType);
  };

  return (
    <div className="w-48">
      <Select 
        value={promptMode} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-background border-muted-foreground/30">
          <SelectValue placeholder="Select conversation style" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="playful">Playful Chat</SelectItem>
            <SelectItem value="young-adult">Chill Talk</SelectItem>
            <SelectItem value="structured">Guided Conversation</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PromptModeSelector;
