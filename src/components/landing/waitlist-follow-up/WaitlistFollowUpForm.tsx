
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { WaitlistFollowUpFormProps } from "./types";
import { WaitlistFollowUpFormProvider } from "./WaitlistFollowUpFormProvider";
import { FormFields } from "./FormFields";
import { FormButtons } from "./FormButtons";

export const WaitlistFollowUpForm = ({ 
  open, 
  onOpenChange,
  userData
}: WaitlistFollowUpFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">You've joined the waitlist!</DialogTitle>
          <DialogDescription>
            We'd love to learn a bit more about you to help find your perfect connections when Twyne launches.
          </DialogDescription>
        </DialogHeader>
        
        <WaitlistFollowUpFormProvider open={open} userData={userData} onOpenChange={onOpenChange}>
          {(providerValue) => (
            <Form {...providerValue.form}>
              <form onSubmit={providerValue.form.handleSubmit(providerValue.onSubmit)} className="space-y-4">
                <FormFields />
                <FormButtons isSubmitting={providerValue.isSubmitting} onSkip={providerValue.handleSkip} />
              </form>
            </Form>
          )}
        </WaitlistFollowUpFormProvider>
      </DialogContent>
    </Dialog>
  );
};
