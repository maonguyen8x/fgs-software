import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContactHtml(data: ContactEmailData): string {
  return `
    <h2>New Contact Inquiry — FGS Software</h2>
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
}

function getGmailTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function sendViaGmail(
  data: ContactEmailData,
  adminEmail: string,
  adminCc?: string
): Promise<{ adminSent: boolean; replySent: boolean }> {
  const transporter = getGmailTransporter();
  if (!transporter) return { adminSent: false, replySent: false };

  const from = process.env.GMAIL_FROM?.trim() || process.env.GMAIL_USER!.trim();
  const subject = `[FGS Software] Liên hệ mới từ ${data.name}${data.company ? ` — ${data.company}` : ""}`;
  const html = buildContactHtml(data);

  try {
    await transporter.sendMail({
      from: `FGS Software <${from}>`,
      to: adminEmail,
      cc: adminCc || undefined,
      replyTo: data.email,
      subject,
      html,
    });

    await transporter.sendMail({
      from: `FGS Software <${from}>`,
      to: data.email,
      subject: "Cảm ơn bạn đã liên hệ FGS Software",
      html: `
        <p>Xin chào ${escapeHtml(data.name)},</p>
        <p>Cảm ơn bạn đã liên hệ FGS Software. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 1–2 ngày làm việc.</p>
        <p>Trân trọng,<br><strong>FGS Software Team</strong></p>
      `,
    });

    return { adminSent: true, replySent: true };
  } catch (error) {
    logger.error("Gmail send failed", { error: String(error) });
    return { adminSent: false, replySent: false };
  }
}

async function sendViaResend(
  data: ContactEmailData,
  adminEmail: string,
  adminCc?: string
): Promise<{ adminSent: boolean; replySent: boolean }> {
  if (!resend) return { adminSent: false, replySent: false };

  const from = process.env.RESEND_FROM?.trim() || "FGS Software <onboarding@resend.dev>";
  const subject = `[FGS Software] New inquiry from ${data.name}${data.company ? ` — ${data.company}` : ""}`;
  const html = buildContactHtml(data);

  const adminResult = await resend.emails.send({
    from,
    to: [adminEmail],
    cc: adminCc ? [adminCc] : undefined,
    replyTo: data.email,
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

/** Gmail SMTP first (if configured), then Resend. */
export async function sendContactEmails(
  data: ContactEmailData,
  adminEmail: string,
  adminCc?: string
): Promise<{ adminSent: boolean; replySent: boolean }> {
  if (getGmailTransporter()) {
    const result = await sendViaGmail(data, adminEmail, adminCc);
    if (result.adminSent) return result;
    logger.warn("Gmail failed, trying Resend fallback");
  }

  if (resend) {
    return sendViaResend(data, adminEmail, adminCc);
  }

  logger.warn("No email provider configured (GMAIL_* or RESEND_API_KEY)");
  return { adminSent: false, replySent: false };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const transporter = getGmailTransporter();
  const html = `
    <p>You requested a password reset for your FGS Admin account.</p>
    <p><a href="${escapeHtml(resetUrl)}">Click here to set a new password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `;

  if (transporter) {
    try {
      const from = process.env.GMAIL_FROM?.trim() || process.env.GMAIL_USER!.trim();
      await transporter.sendMail({
        from: `FGS Software <${from}>`,
        to,
        subject: "FGS Admin — Reset your password",
        html,
      });
      return true;
    } catch (error) {
      logger.error("Gmail password reset failed", { error: String(error) });
    }
  }

  if (!resend) {
    logger.warn("RESEND_API_KEY not set — password reset link logged for development", { resetUrl });
    return false;
  }

  const from = process.env.RESEND_FROM?.trim() || "FGS Software <onboarding@resend.dev>";
  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "FGS Admin — Reset your password",
    html,
  });

  if (result.error) {
    logger.error("Password reset email failed", { error: result.error.message });
    return false;
  }
  return true;
}

export function getDefaultAdminEmail(): string {
  return (
    process.env.CONTACT_ADMIN_EMAIL?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "contact.fgssoftware@gmail.com"
  );
}
