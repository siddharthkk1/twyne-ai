
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface NameCollectionStepProps {
  onSubmit: (name: string) => void;
}

const NameCollectionStep: React.FC<NameCollectionStepProps> = ({ onSubmit }) => {
  const [name, setName] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">What's your name?</h2>
      <p className="text-muted-foreground mb-8">
        This helps Twyne personalize your conversation experience.
      </p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="text-lg py-6"
        />
        
        <Button 
          type="submit" 
          className="w-full py-6 text-lg group"
          disabled={!name.trim()}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </div>
  );
};

export default NameCollectionStep;
