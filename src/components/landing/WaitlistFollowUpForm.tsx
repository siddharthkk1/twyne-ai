
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Schema for follow-up details
const followUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  age: z.string()
    .refine(val => !isNaN(parseInt(val)), { message: "Age must be a number" })
    .transform(val => parseInt(val)),
  interests: z.string().min(2, { message: "Please share at least one interest." }),
  motivation: z.string().min(2, { message: "Please tell us why you're interested in Twyne." }),
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

interface WaitlistFollowUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {email: string, location: string, phoneNumber?: string} | null;
}

export const WaitlistFollowUpForm = ({ open, onOpenChange, userData }: WaitlistFollowUpFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      fullName: "",
      age: "",
      interests: "",
      motivation: "",
    },
  });

  const onSubmit = async (data: FollowUpFormValues) => {
    if (!userData) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a random number of people on waitlist from user's city (between 20-200)
      const cityWaitlistCount = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
      
      // Update the user's entry in Supabase with the additional information
      const { error } = await supabase
        .from('waitlist')
        .update({
          full_name: data.fullName,
          age: data.age,
          interests: data.interests,
          motivation: data.motivation
        })
        .eq('email', userData.email);
      
      if (error) {
        console.error("Error updating waitlist entry:", error);
        throw error;
      } else {
        setIsCompleted(true);
        toast({
          title: "Thanks for the additional information!",
          description: `We'll notify you when Twyne is ready. There are already ${cityWaitlistCount} people from ${userData.location} on our waitlist!`,
          position: "center",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
        position: "center",
      });
      console.error("Waitlist follow-up submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to close the dialog and reset state
  const handleClose = () => {
    onOpenChange(false);
    // Wait a bit before resetting the completed state to ensure animation completes
    setTimeout(() => {
      setIsCompleted(false);
      form.reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[425px] ${isMobile ? 'max-h-[90vh] overflow-y-auto p-4 rounded-lg' : ''}`}>
        {!isCompleted ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl">You're on the Waitlist!</DialogTitle>
              <DialogDescription>
                We'd love to learn a bit more about you to help find your perfect connections when Twyne launches.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input placeholder="30" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Interests */}
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List a few of your interests</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Reading, hiking, photography, etc."
                          className="resize-none h-16"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This helps us match you with people who share similar interests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Motivation */}
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why are you interested in Twyne?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What draws you to join our community?"
                          className="resize-none h-16"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This helps us understand your goals and create better connections.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-4 pt-1">
                  <div className="flex flex-col w-full gap-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Complete Profile"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleClose}
                    >
                      Skip for now
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl mb-2">You're all set!</DialogTitle>
            <DialogDescription className="text-center mb-6">
              Thanks for joining the Twyne waitlist. We'll notify you when we launch in your area.
            </DialogDescription>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
