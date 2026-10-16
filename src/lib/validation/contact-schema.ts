import { z } from "zod";

export type ContactValidationMessages = {
  nameRequired: string;
  nameMin: string;
  phoneRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  messageMin: string;
};

export function createContactSchema(messages: ContactValidationMessages) {
  return z.object({
    firstName: z
      .string({ required_error: messages.nameRequired })
      .trim()
      .min(1, messages.nameRequired)
      .max(100),
    lastName: z
      .string({ required_error: messages.nameRequired })
      .trim()
      .min(1, messages.nameRequired)
      .max(100),
    email: z
      .string({ required_error: messages.emailRequired })
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    phone: z
      .string({ required_error: messages.phoneRequired })
      .trim()
      .min(1, messages.phoneRequired)
      .max(50),
    message: z
      .string({ required_error: messages.messageRequired })
      .trim()
      .min(1, messages.messageRequired)
      .min(20, messages.messageMin),
  });
}

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;
