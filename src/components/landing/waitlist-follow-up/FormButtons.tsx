
import React from "react";
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  isSubmitting: boolean;
  onSkip: () => void;
}

export const FormButtons = ({ isSubmitting, onSkip }: FormButtonsProps) => {
  return (
    <div className="mt-6 flex flex-col space-y-2 w-full">
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Complete Registration"}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={onSkip} 
        className="w-full text-foreground bg-white border-muted-foreground/30"
      >
        Skip
      </Button>
    </div>
  );
};
