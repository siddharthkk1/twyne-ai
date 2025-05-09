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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Please enter your location." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().optional(),
  // Make age required now, not optional
  age: z.string()
    .refine(val => !isNaN(parseInt(val)), { message: "Age must be a number" })
    .transform(val => val ? parseInt(val) : null),
  interests: z.string().min(2, { message: "Please share at least one interest." }),
  motivation: z.string().min(2, { message: "Please tell us why you're interested in Twyne." }),
});

// This helps TypeScript determine the type BEFORE any transformations occur in the schema
type FormInputValues = {
  fullName: string;
  location: string;
  email: string;
  phoneNumber?: string;
  age: string; // Age is a string in the form input
  interests: string;
  motivation: string;
};

// This is what comes out after transformation
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

  // Use FormInputValues here instead of FormValues to get the pre-transformation types
  const form = useForm<FormInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      location: "",
      email: "",
      phoneNumber: "",
      age: "", // This is correct now - string type in inputs
      interests: "",
      motivation: "",
    },
  });

  // Update the onSubmit function to use FormInputValues instead of FormValues
  const onSubmit = async (data: FormInputValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a random number of people on waitlist from user's city (between 20-200)
      const cityWaitlistCount = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
      
      // Process the form data with the validated/transformed values from Zod
      const validatedData = formSchema.parse(data);
      
      // Fixed: Type the submission object properly to match the database schema
      const submissionData = {
        email: validatedData.email,
        full_name: validatedData.fullName,
        location: validatedData.location,
        phone_number: validatedData.phoneNumber || null,
        age: validatedData.age || null, // Now using the transformed number value
        interests: validatedData.interests,
        motivation: validatedData.motivation
      };

      // Insert data into the waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert(submissionData);
      
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
      } else {
        toast({
          title: "You've joined the waitlist!",
          description: `We'll notify you via email${data.phoneNumber ? " or text" : ""} when Twyne is ready. There are already ${cityWaitlistCount} people from ${data.location} on our waitlist!`,
          position: "center",
        });
      }
      
      form.reset();
      onOpenChange(false);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when Twyne launches in your city.
          </DialogDescription>
          {!isLoading && waitlistCount !== null && (
            <div className="flex items-center justify-center py-1 px-4 bg-muted/40 rounded-md mb-1">
              <Users size={18} className="mr-2 text-primary" />
              <span className="text-sm font-medium">
                Join {waitlistCount.toLocaleString()} people already on the waitlist
              </span>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 py-1">
            {/* Row 1: Full Name (single line) */}
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
            
            {/* Row 2: Location and Age (on same line) */}
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
            </div>
            
            {/* Row 3: Email (single line) */}
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
            
            {/* Row 4: Phone Number with description */}
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
            
            {/* Row 5: Interests with smaller height */}
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List a few of your interests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reading, hiking, photography, etc."
                      className="resize-none h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Row 6: Motivation with smaller height */}
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why are you interested in Twyne?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What draws you to join our community?"
                      className="resize-none h-12"
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
