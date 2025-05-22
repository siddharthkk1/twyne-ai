
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MessageSquare, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface ConversationModeSelectorProps {
  handleModeSelection: (mode: "text" | "voice" | "sms") => void;
}

const ConversationModeSelector: React.FC<ConversationModeSelectorProps> = ({
  handleModeSelection,
}) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  
  const handleSmsSelection = () => {
    if (!showPhoneInput) {
      setShowPhoneInput(true);
      return;
    }
    
    // Simple phone validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code (e.g. +12345678901)",
        variant: "destructive"
      });
      return;
    }
    
    handleModeSelection("sms");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5 relative">
      {/* Back button positioned at the top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (showPhoneInput) {
              setShowPhoneInput(false);
            } else {
              navigate(-1);
            }
          }}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {showPhoneInput ? "Back to options" : "Back"}
        </Button>
      </div>
      
      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">How would you like to chat?</h1>
          <p className="text-muted-foreground mb-8">
            Choose your preferred way to communicate
          </p>
          
          {!showPhoneInput ? (
            <div className="flex flex-col space-y-4">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 h-16 text-lg"
                onClick={() => handleModeSelection("text")}
              >
                <MessageSquare className="h-5 w-5" />
                Type messages
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 h-16 text-lg"
                onClick={() => handleModeSelection("voice")}
              >
                <Mic className="h-5 w-5" />
                Use voice
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 h-16 text-lg"
                onClick={handleSmsSelection}
              >
                <Phone className="h-5 w-5" />
                Chat via SMS
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-left space-y-2">
                <Label htmlFor="phone-number">Enter your phone number</Label>
                <Input 
                  id="phone-number"
                  type="tel"
                  placeholder="+12345678901"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Please include your country code (e.g. +1 for US)
                </p>
              </div>
              
              <Button
                className="w-full h-12 mt-4"
                onClick={handleSmsSelection}
              >
                Start SMS conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationModeSelector;
