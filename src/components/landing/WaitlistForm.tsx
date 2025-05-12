
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Simplified form schema with just email, location, and optional phone number
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  location: z.string().min(2, { message: "Please enter your location." }),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WaitlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: (data: FormValues) => void;
}

// The artificial boost we want to add to the waitlist count
const WAITLIST_BOOST = 524;

export const WaitlistForm = ({ open, onOpenChange, onSubmitSuccess }: WaitlistFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      if (!open) return; // Only fetch when the form is open
      
      try {
        setIsLoading(true);
        
        // Instead of using count: 'exact', fetch all entries and count them
        const { data, error } = await supabase
          .from('waitlist')
          .select('id');
        
        if (error) {
          console.error("WaitlistForm: Error fetching waitlist count:", error);
        } else {
          // Count the actual entries returned
          const actualCount = data ? data.length : 0;
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
      location: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Pass the data to the parent component for the follow-up form
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
      
      // Store the initial submission in Supabase without placeholder data
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email: data.email,
          location: data.location,
          phone_number: data.phoneNumber || null,
        });
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint error (email already exists)
          toast({
            title: "You're already on the waitlist!",
            description: "We'll notify you when Twyne is ready.",
            position: "center",
          });
        } else {
          console.error("Error submitting to waitlist:", error);
          throw error;
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
        position: "center",
      });
      console.error("Waitlist submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${isMobile ? 'max-h-[90vh] overflow-y-auto p-4 rounded-lg' : ''}`}>
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when Twyne launches in your city.
          </DialogDescription>
          {!isLoading && waitlistCount !== null && (
            <div className="flex items-center justify-center py-1 px-4 bg-muted/40 rounded-md mb-1">
              <Users size={10} className="mr-2 text-primary" />
              <span className="text-sm font-medium">
                {waitlistCount.toLocaleString()} people are already waiting to meet someone new in their city!
              </span>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-1">
            {/* Email */}
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
            
            {/* Location */}
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
            
            {/* Phone Number (Optional) */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    This allows us to contact you when Twyne is available in your area.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4 pt-1 pb-4">
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
