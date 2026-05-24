import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
}

export async function sendContactEmails(
  data: ContactEmailData,
  adminEmail: string,
  adminCc?: string
): Promise<{ adminSent: boolean; replySent: boolean }> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping email send");
    return { adminSent: false, replySent: false };
  }

  const from = "FGS Software <onboarding@resend.dev>";
  const subject = `[FGS Software] New inquiry from ${data.name}${data.company ? ` — ${data.company}` : ""}`;

  const html = `
    <h2>New Contact Inquiry</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${escapeHtml(data.name)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${escapeHtml(data.email)}</td></tr>
      ${data.company ? `<tr><td style="padding:8px;font-weight:bold;">Company</td><td style="padding:8px;">${escapeHtml(data.company)}</td></tr>` : ""}
      ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(data.phone)}</td></tr>` : ""}
      ${data.projectType ? `<tr><td style="padding:8px;font-weight:bold;">Project Type</td><td style="padding:8px;">${escapeHtml(data.projectType)}</td></tr>` : ""}
      ${data.budget ? `<tr><td style="padding:8px;font-weight:bold;">Budget</td><td style="padding:8px;">${escapeHtml(data.budget)}</td></tr>` : ""}
      <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px;">${escapeHtml(data.message).replace(/\n/g, "<br>")}</td></tr>
    </table>
  `;

  const adminResult = await resend.emails.send({
    from,
    to: [adminEmail],
    cc: adminCc ? [adminCc] : undefined,
    subject,
    html,
  });

  const replyResult = await resend.emails.send({
    from,
    to: [data.email],
    subject: "Thank you for contacting FGS Software",
    html: `
      <p>Dear ${escapeHtml(data.name)},</p>
      <p>Thank you for reaching out to FGS Software. We have received your inquiry and will get back to you within 1–2 business days.</p>
      <p>Best regards,<br><strong>FGS Software Team</strong></p>
    `,
  });

  return {
    adminSent: !adminResult.error,
    replySent: !replyResult.error,
  };
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — password reset link logged for development", {
      resetUrl,
    });
    return false;
  }

  const from = "FGS Software <onboarding@resend.dev>";
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "FGS Admin — Reset your password",
    html: `
      <p>You requested a password reset for your FGS Admin account.</p>
      <p><a href="${escapeHtml(resetUrl)}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });

  if (result.error) {
    logger.error("Password reset email failed", { error: result.error.message });
    return false;
  }
  return true;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
