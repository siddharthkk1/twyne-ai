
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formSchema, WaitlistFollowUpFormValues } from "./types";

interface WaitlistFollowUpFormProviderProps {
  open: boolean;
  userData: {email: string, location: string, phoneNumber?: string} | null;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const WaitlistFollowUpFormProvider = ({ 
  open, 
  userData, 
  onOpenChange, 
  children 
}: WaitlistFollowUpFormProviderProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistLocationCount, setWaitlistLocationCount] = useState(0);

  const form = useForm<WaitlistFollowUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: undefined as unknown as number,
      interests: "",
      motivation: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        fullName: "",
        age: undefined as unknown as number,
        interests: "",
        motivation: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: WaitlistFollowUpFormValues) => {
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

  const providerValue = {
    form,
    isSubmitting,
    onSubmit,
    handleSkip
  };

  return (
    <FormProvider {...form}>
      {children(providerValue)}
    </FormProvider>
  );
};
