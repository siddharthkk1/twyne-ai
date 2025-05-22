
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SmsInputProps {
  phoneNumber: string;
  isDisabled: boolean;
  switchToTextMode: () => void;
}

const SmsInput: React.FC<SmsInputProps> = ({
  phoneNumber,
  isDisabled,
  switchToTextMode,
}) => {
  return (
    <div className="w-full space-y-2">
      <Alert className="bg-muted/50">
        <MessageSquare className="h-4 w-4" />
        <AlertTitle>SMS Conversation Active</AlertTitle>
        <AlertDescription>
          We're chatting with you via SMS at {phoneNumber}. Reply to our texts to continue the conversation.
          Messages will appear here as well.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={switchToTextMode}
          disabled={isDisabled}
        >
          Switch to text input
        </Button>
        
        <span className="text-xs text-muted-foreground">
          Reply to our SMS to continue
        </span>
      </div>
    </div>
  );
};

export default SmsInput;
