
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";

interface CreateAccountPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAccountPrompt = ({ open, onOpenChange }: CreateAccountPromptProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // If user is already logged in, don't show the dialog
  if (user) {
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Please check your email for a confirmation link.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Create your account</DialogTitle>
          <DialogDescription className="text-center">
            Save your profile and unlock all Twyne features
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="******" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            <Button type="button" variant="outline" onClick={handleSkip} className="w-full">
              Skip for now
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-2">
              <p>Already have an account? 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => onOpenChange(false)}>
                  Log in instead
                </Button>
              </p>
            </div>
          </div>
        </form>
        
        <DialogFooter className="flex justify-center pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="h-3 w-3 mr-1" />
            <span>Your email is only used for account access</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
