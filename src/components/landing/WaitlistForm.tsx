
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
});

type FormValues = z.infer<typeof formSchema>;

interface WaitlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistForm = ({ open, onOpenChange }: WaitlistFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        setIsLoading(true);
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Error fetching waitlist count:", error);
        } else {
          setWaitlistCount(count || 0);
        }
      } catch (error) {
        console.error("Error in waitlist count fetch:", error);
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
      motivation: ""
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Insert email and additional fields into the waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          email: data.email,
          full_name: data.fullName,
          location: data.location,
          interests: data.interests,
          motivation: data.motivation
        }]);
      
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
          description: "We'll notify you when Twyne is ready.",
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
        <DialogHeader>
          <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when Twyne launches in your city.
          </DialogDescription>
          {!isLoading && waitlistCount !== null && waitlistCount > 0 && (
            <div className="flex items-center justify-center mt-3 py-2 px-4 bg-muted/40 rounded-md">
              <Users size={18} className="mr-2 text-primary" />
              <span className="text-sm font-medium">
                Join {waitlistCount.toLocaleString()}+ people already on the waitlist
              </span>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List a few of your interests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reading, hiking, photography, etc."
                      className="resize-none"
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
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 pt-2">
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
