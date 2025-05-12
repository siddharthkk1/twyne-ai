
import { z } from "zod";

// Follow-up form schema with additional fields
export const formSchema = z.object({
  fullName: z.string().min(2, { message: "Please enter your full name." }),
  age: z.coerce.number().min(1, { message: "Please enter a valid age." }),
  interests: z.string().min(3, { message: "Please share some of your interests." }),
  motivation: z.string().min(3, { message: "Please tell us why you're interested in Twyne." }),
});

export type WaitlistFollowUpFormValues = z.infer<typeof formSchema>;

export interface WaitlistFollowUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {email: string, location: string, phoneNumber?: string} | null;
}
