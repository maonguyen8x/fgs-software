import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveContactInboxEmail, sendContactEmails } from "@/lib/email";
import { getSettingsMap } from "@/lib/settings";
import { apiSuccess, apiError, apiValidationError, apiServerError } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { sanitizeEmail, sanitizeText } from "@/lib/security/sanitize";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  projectType: z.string().max(50).optional(),
  budget: z.string().max(50).optional(),
  message: z.string().min(20).max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.parse(body);

    const data = {
      name: sanitizeText(parsed.name, 100),
      email: sanitizeEmail(parsed.email),
      company: parsed.company ? sanitizeText(parsed.company, 200) : undefined,
      phone: parsed.phone ? sanitizeText(parsed.phone, 50) : undefined,
      projectType: parsed.projectType ? sanitizeText(parsed.projectType, 50) : undefined,
      budget: parsed.budget ? sanitizeText(parsed.budget, 50) : undefined,
      message: sanitizeText(parsed.message, 5000),
    };

    const settings = await getSettingsMap();
    const inboxEmail = resolveContactInboxEmail(settings);

    const message = await prisma.message.create({ data });

    const emailResult = await sendContactEmails(data, inboxEmail, settings.admin_email_cc);

    if (!emailResult.adminSent) {
      logger.error("Contact form email not delivered", {
        inboxEmail,
        code: emailResult.code,
        error: emailResult.error,
      });
      return apiError(
        emailResult.code === "EMAIL_NOT_CONFIGURED"
          ? "Email service is not configured on the server"
          : "Could not deliver your message by email",
        503,
        emailResult.code ?? "EMAIL_SEND_FAILED"
      );
    }

    return apiSuccess({
      success: true,
      messageId: message.id,
      emailSent: true,
      inbox: inboxEmail,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiValidationError();
    }
    logger.error("Contact API error", { error: String(error) });
    return apiServerError();
  }
}
