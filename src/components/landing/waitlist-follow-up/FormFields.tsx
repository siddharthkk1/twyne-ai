
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { WaitlistFollowUpFormValues } from "./types";

export const FormFields = () => {
  const form = useFormContext<WaitlistFollowUpFormValues>();
  
  return (
    <>
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
    </>
  );
};
