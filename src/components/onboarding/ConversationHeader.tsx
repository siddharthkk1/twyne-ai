
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversationHeaderProps {
  isGeneratingProfile: boolean;
  progress: number;
  setShowGuidanceInfo: React.Dispatch<React.SetStateAction<boolean>>;
  showGuidanceInfo: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  isGeneratingProfile,
  progress,
  setShowGuidanceInfo,
  showGuidanceInfo
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-lg bg-background/80 border-b">
      <div className="container mx-auto px-4 pt-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/onboarding")}
          className="text-sm flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to options
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-background/50">
            {isGeneratingProfile ? "Creating profile..." : "Getting to know you"}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowGuidanceInfo(!showGuidanceInfo)}
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Help
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="container mx-auto px-4 mt-2 pb-2">
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
};

export default ConversationHeader;
