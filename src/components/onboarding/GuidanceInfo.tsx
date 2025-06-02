
import React from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GuidanceInfoProps {
  showGuidanceInfo: boolean;
  setShowGuidanceInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

const GuidanceInfo: React.FC<GuidanceInfoProps> = ({ showGuidanceInfo, setShowGuidanceInfo }) => (
  <>
    {/* Always visible help button for accessibility */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`fixed bottom-4 right-4 z-50 h-10 w-10 p-0 shadow-lg transition-all duration-300 ${
              showGuidanceInfo ? 'opacity-50' : 'opacity-100 hover:opacity-90'
            }`}
            onClick={() => setShowGuidanceInfo(true)}
            aria-label="Show guidance information"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>How this conversation works</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    {/* Guidance info panel */}
    <div className={`fixed ${showGuidanceInfo ? 'bottom-[80px]' : 'bottom-[-400px]'} right-4 w-80 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-lg p-4 transition-all duration-300 z-50`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          How This Conversation Works
        </h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowGuidanceInfo(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>This is <span className="font-medium text-foreground">private</span> — just between you and Twyne.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>You'll decide later what (if anything) gets shared with others.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>Not sure about something? It's totally fine to say "idk," "skip," or ask to talk about something else.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>What you choose to go into (or not) helps Twyne get your vibe — no pressure either way.</span>
        </p>
      </div>
    </div>
  </>
);

export default GuidanceInfo;
