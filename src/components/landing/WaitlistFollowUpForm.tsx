
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Follow-up form schema with additional fields
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Please enter your full name." }),
  age: z.coerce.number().min(1, { message: "Please enter a valid age." }),
  interests: z.string().min(3, { message: "Please share some of your interests." }),
  motivation: z.string().min(3, { message: "Please tell us why you're interested in Twyne." }),
});

type FormValues = z.infer<typeof formSchema>;

interface WaitlistFollowUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {email: string, location: string, phoneNumber?: string} | null;
}

export const WaitlistFollowUpForm = ({ 
  open, 
  onOpenChange,
  userData
}: WaitlistFollowUpFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistLocationCount, setWaitlistLocationCount] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: undefined as unknown as number, // Initialize as undefined but type as number
      interests: "",
      motivation: "",
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        fullName: "",
        age: undefined as unknown as number,
        interests: "",
        motivation: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormValues) => {
    if (!userData?.email) {
      toast({
        title: "Error",
        description: "Missing user data from previous step",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, get the record we need to update
      const { data: existingRecord, error: fetchError } = await supabase
        .from('waitlist')
        .select('*')
        .eq('email', userData.email)
        .single();
      
      if (fetchError) {
        console.error("Error fetching waitlist record:", fetchError);
        throw fetchError;
      }
      
      // Now we update the record with the additional information
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({
          full_name: data.fullName,
          age: data.age,
          interests: data.interests,
          motivation: data.motivation
        })
        .eq('id', existingRecord.id);
      
      if (updateError) {
        console.error("Error updating waitlist information:", updateError);
        throw updateError;
      }
      
      // Generate a random count of people in the user's location (between 15-85)
      const randomLocationCount = Math.floor(Math.random() * 71) + 15;
      setWaitlistLocationCount(randomLocationCount);
      
      // Close the dialog and show success notification
      onOpenChange(false);
      
      // Show location-specific count notification
      toast({
        title: "Welcome to the waitlist!",
        description: `You're joining ${randomLocationCount} other people from ${userData.location} on the waitlist. We'll be in touch soon!`,
        position: "center",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "We couldn't update your information. Please try again later.",
        variant: "destructive",
        position: "center",
      });
      console.error("Waitlist follow-up error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skipping the follow-up form
  const handleSkip = () => {
    onOpenChange(false);
    toast({
      title: "You're on the waitlist!",
      description: "We've added you to the waitlist and will notify you when Twyne is available in your area.",
      position: "center",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">You've joined the waitlist!</DialogTitle>
          <DialogDescription>
            We'd love to learn a bit more about you to help find your perfect connections when Twyne launches.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                    <Input 
                      type="number" 
                      placeholder="24" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    />
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
                  <FormLabel>Your Interests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., hiking, book clubs, photography, trying new restaurants..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
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
                      placeholder="e.g., I'm new to the area and looking to build my social circle..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Using a custom div instead of DialogFooter for better control */}
            <div className="mt-6 flex flex-col space-y-4 w-full">
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
                onClick={handleSkip} 
                className="w-full text-foreground bg-white border-muted-foreground/30"
              >
                Skip
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
