import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import {
  DEFAULT_CONTACT_INBOX,
  isEmailConfigActive,
  resolveContactInboxFromConfig,
  resolveEmailConfig,
  type ResolvedEmailConfig,
} from "@/lib/email/config";

export { DEFAULT_CONTACT_INBOX } from "@/lib/email/config";

export interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
}

export interface ContactEmailResult {
  adminSent: boolean;
  replySent: boolean;
  provider?: "smtp" | "resend" | "none";
  error?: string;
  code?: "EMAIL_NOT_CONFIGURED" | "EMAIL_SEND_FAILED";
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

function isPlaceholderApiKey(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim();
  return /x{4,}/i.test(v) || v === "re_xxxxxxxxxxxx" || v === "sk-xxxxxxxx";
}

function getSmtpTransporter(config: ResolvedEmailConfig): Transporter | null {
  const user = config.gmailUser;
  const pass = config.gmailAppPassword;
  if (!user || !pass) return null;

  const host = config.smtpHost;
  if (host) {
    const port = config.smtpPort || 587;
    const secure = config.smtpSecure || port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getResendClient(config: ResolvedEmailConfig): Resend | null {
  const key = config.resendApiKey;
  if (!key || isPlaceholderApiKey(key)) return null;
  return new Resend(key);
}

export function isContactEmailConfigured(settings?: Record<string, string>): boolean {
  return isEmailConfigActive(resolveEmailConfig(settings));
}

export function getDefaultAdminEmail(): string {
  return resolveEmailConfig().contactInbox || DEFAULT_CONTACT_INBOX;
}

export function resolveContactInboxEmail(settings?: Record<string, string>): string {
  const config = resolveEmailConfig(settings);
  return resolveContactInboxFromConfig(settings, config);
}

function parseMailAddress(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/<([^>]+)>/);
  return (match?.[1] ?? trimmed).trim();
}

function getMailFromAddress(config: ResolvedEmailConfig): string {
  const raw =
    config.gmailFrom ||
    config.gmailUser ||
    DEFAULT_CONTACT_INBOX;
  return parseMailAddress(raw);
}

function formatMailFrom(email: string): string {
  return `FGS Software <${email}>`;
}

async function sendViaSmtp(
  data: ContactEmailData,
  adminEmail: string,
  config: ResolvedEmailConfig,
  adminCc?: string
): Promise<ContactEmailResult> {
  const transporter = getSmtpTransporter(config);
  if (!transporter) {
    return {
      adminSent: false,
      replySent: false,
      provider: "none",
      code: "EMAIL_NOT_CONFIGURED",
      error: "SMTP not configured (set GMAIL_USER + GMAIL_APP_PASSWORD or SMTP_* in .env)",
    };
  }

  const from = getMailFromAddress(config);
  const subject = `[FGS Software] Liên hệ mới từ ${data.name}${data.company ? ` — ${data.company}` : ""}`;
  const html = buildContactHtml(data);

  try {
    await transporter.sendMail({
      from: formatMailFrom(from),
      to: adminEmail,
      cc: adminCc || undefined,
      replyTo: data.email,
      subject,
      html,
    });

    let replySent = false;
    try {
      await transporter.sendMail({
        from: formatMailFrom(from),
        to: data.email,
        subject: "Cảm ơn bạn đã liên hệ FGS Software",
        html: `
          <p>Xin chào ${escapeHtml(data.name)},</p>
          <p>Cảm ơn bạn đã liên hệ FGS Software. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 1–2 ngày làm việc.</p>
          <p>Trân trọng,<br><strong>FGS Software Team</strong></p>
        `,
      });
      replySent = true;
    } catch (replyError) {
      logger.warn("Contact auto-reply failed", { error: String(replyError) });
    }

    return { adminSent: true, replySent, provider: "smtp" };
  } catch (error) {
    logger.error("SMTP contact email failed", { error: String(error), to: adminEmail });
    return {
      adminSent: false,
      replySent: false,
      provider: "smtp",
      code: "EMAIL_SEND_FAILED",
      error: String(error),
    };
  }
}

async function sendViaResend(
  data: ContactEmailData,
  adminEmail: string,
  config: ResolvedEmailConfig,
  adminCc?: string
): Promise<ContactEmailResult> {
  const resend = getResendClient(config);
  if (!resend) {
    return {
      adminSent: false,
      replySent: false,
      provider: "none",
      code: "EMAIL_NOT_CONFIGURED",
      error: "Resend not configured (set a valid RESEND_API_KEY in .env)",
    };
  }

  const from = config.resendFrom.trim() || `FGS Software <onboarding@resend.dev>`;
  const subject = `[FGS Software] New inquiry from ${data.name}${data.company ? ` — ${data.company}` : ""}`;
  const html = buildContactHtml(data);

  try {
    const adminResult = await resend.emails.send({
      from,
      to: [adminEmail],
      cc: adminCc ? [adminCc] : undefined,
      replyTo: data.email,
      subject,
      html,
    });

    if (adminResult.error) {
      logger.error("Resend admin email failed", { error: adminResult.error.message });
      return {
        adminSent: false,
        replySent: false,
        provider: "resend",
        code: "EMAIL_SEND_FAILED",
        error: adminResult.error.message,
      };
    }

    let replySent = false;
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
    replySent = !replyResult.error;

    return { adminSent: true, replySent, provider: "resend" };
  } catch (error) {
    logger.error("Resend contact email failed", { error: String(error) });
    return {
      adminSent: false,
      replySent: false,
      provider: "resend",
      code: "EMAIL_SEND_FAILED",
      error: String(error),
    };
  }
}

/** SMTP (Gmail / Google Workspace) first, then Resend. */
export async function sendContactEmails(
  data: ContactEmailData,
  adminEmail: string,
  adminCc?: string,
  settings?: Record<string, string>
): Promise<ContactEmailResult> {
  const config = resolveEmailConfig(settings);
  const smtp = getSmtpTransporter(config);
  if (smtp) {
    const result = await sendViaSmtp(data, adminEmail, config, adminCc);
    if (result.adminSent) return result;
    logger.warn("SMTP failed, trying Resend fallback", { error: result.error });
  }

  const resend = getResendClient(config);
  if (resend) {
    return sendViaResend(data, adminEmail, config, adminCc);
  }

  logger.warn("No email provider configured — set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY");
  return {
    adminSent: false,
    replySent: false,
    provider: "none",
    code: "EMAIL_NOT_CONFIGURED",
    error: "No email provider configured",
  };
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  settings?: Record<string, string>
): Promise<boolean> {
  const config = resolveEmailConfig(settings);
  const transporter = getSmtpTransporter(config);
  const html = `
    <p>You requested a password reset for your FGS Admin account.</p>
    <p><a href="${escapeHtml(resetUrl)}">Click here to set a new password</a></p>
    <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `;

  if (transporter) {
    try {
      const from = getMailFromAddress(config);
      await transporter.sendMail({
        from: formatMailFrom(from),
        to,
        subject: "FGS Admin — Reset your password",
        html,
      });
      return true;
    } catch (error) {
      logger.error("SMTP password reset failed", { error: String(error) });
    }
  }

  const resend = getResendClient(config);
  if (!resend) {
    logger.warn("No email provider — password reset link logged for development", { resetUrl });
    return false;
  }

  const from = config.resendFrom.trim() || "FGS Software <onboarding@resend.dev>";
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
