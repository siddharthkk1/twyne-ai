
import React, { useState, useEffect } from "react";
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
import { Users } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Please enter your location." }),
  interests: z.string().min(2, { message: "Please share at least one interest." }),
  motivation: z.string().min(2, { message: "Please tell us why you're interested in Twyne." }),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WaitlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

export const WaitlistForm = ({ open, onOpenChange }: WaitlistFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      if (!open) return; // Only fetch when the form is open
      
      try {
        setIsLoading(true);
        console.log("WaitlistForm: Fetching waitlist count...");
        
        // Instead of using count: 'exact', fetch all entries and count them
        const { data, error } = await supabase
          .from('waitlist')
          .select('id');
        
        // Log the full response data for debugging
        console.log("WaitlistForm: DETAILED DATA:", data);
        
        if (error) {
          console.error("WaitlistForm: Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
          console.log("WaitlistForm: Actual count from DB:", actualCount);
          console.log("WaitlistForm: Data type:", typeof data);
          console.log("WaitlistForm: Is data an array?", Array.isArray(data));
          console.log("WaitlistForm: Setting total count to:", actualCount + WAITLIST_BOOST);
          setWaitlistCount(actualCount + WAITLIST_BOOST);
        }
      } catch (error) {
        console.error("WaitlistForm: Error in waitlist count fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchWaitlistCount();
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      location: "",
      interests: "",
      motivation: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a random number of people on waitlist from user's city (between 20-200)
      const cityWaitlistCount = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
      
      // Fixed: Type the submission object properly to match the database schema
      const submissionData = {
        email: data.email,
        full_name: data.fullName,
        location: data.location,
        interests: data.interests,
        motivation: data.motivation
        // We omit phone_number since it causes schema cache issues
      };

      // Insert email and additional fields into the waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert(submissionData);
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint error (email already exists)
          toast({
            title: "You're already on the waitlist!",
            description: "We'll notify you when Twyne is ready.",
          });
        } else {
          console.error("Error submitting to waitlist:", error);
          throw error;
        }
      } else {
        toast({
          title: "You've joined the waitlist!",
          description: `We'll notify you via email${data.phoneNumber ? " or text" : ""} when Twyne is ready. There are already ${cityWaitlistCount} people from ${data.location} on our waitlist!`,
        });
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Waitlist submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when Twyne launches in your city.
          </DialogDescription>
          {!isLoading && waitlistCount !== null && (
            <div className="flex items-center justify-center py-1 px-4 bg-muted/40 rounded-md">
              <Users size={18} className="mr-2 text-primary" />
              <span className="text-sm font-medium">
                Join {waitlistCount.toLocaleString()} people already on the waitlist
              </span>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List a few of your interests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reading, hiking, photography, etc."
                      className="resize-none h-14"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why are you interested in Twyne?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What draws you to join our community?"
                      className="resize-none h-14"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4 pt-1">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
