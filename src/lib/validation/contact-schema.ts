import { z } from "zod";

export type ContactValidationMessages = {
  nameRequired: string;
  nameMin: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  messageMin: string;
};

export function createContactSchema(messages: ContactValidationMessages) {
  return z.object({
    name: z
      .string({ required_error: messages.nameRequired })
      .trim()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin),
    email: z
      .string({ required_error: messages.emailRequired })
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    company: z.string().optional(),
    phone: z.string().optional(),
    projectType: z.string().optional(),
    budget: z.string().optional(),
    message: z
      .string({ required_error: messages.messageRequired })
      .trim()
      .min(1, messages.messageRequired)
      .min(20, messages.messageMin),
  });
}

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;
