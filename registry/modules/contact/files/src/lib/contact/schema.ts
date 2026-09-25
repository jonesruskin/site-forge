import { z } from "zod";

/** Shared by the form (client) and the action (server). */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(100),
  email: z.email("Please enter a valid email address.").trim().max(200),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail helps us reply (10 characters minimum).")
    .max(5000, "Please keep it under 5,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof ContactInput, string[]>>;
  values?: Partial<ContactInput>;
};
