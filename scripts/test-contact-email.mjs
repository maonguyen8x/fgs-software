import "dotenv/config";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const inbox =
  process.env.CONTACT_ADMIN_EMAIL?.trim() ||
  process.env.ADMIN_EMAIL?.trim() ||
  "contact.fgssoftware@gmail.com";

const gmailUser = process.env.GMAIL_USER?.trim();
const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || "").replace(/\s/g, "");
const smtpHost = process.env.SMTP_HOST?.trim();
const resendKey = process.env.RESEND_API_KEY?.trim();

console.log("=== Contact email config check ===");
console.log("Inbox (to):", inbox);
console.log("GMAIL_USER:", gmailUser || "(not set)");
console.log("GMAIL_APP_PASSWORD:", gmailPass ? `set (${gmailPass.length} chars)` : "(not set)");
console.log("SMTP_HOST:", smtpHost || "(default gmail service)");
console.log("RESEND_API_KEY:", resendKey ? `set (${resendKey.slice(0, 8)}...)` : "(not set)");
console.log("RESEND_FROM:", process.env.RESEND_FROM || "(not set)");
console.log("");

const testPayload = {
  name: "FGS Test",
  email: "test@example.com",
  message: "Automated contact form email test from scripts/test-contact-email.mjs",
};

async function trySmtp(label, user, pass) {
  if (!user || !pass) return { ok: false, error: "missing credentials" };

  const transport = smtpHost
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
      })
    : nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  try {
    await transport.verify();
    const info = await transport.sendMail({
      from: `FGS Software <${process.env.GMAIL_FROM || user}>`,
      to: inbox,
      subject: `[TEST SMTP ${label}] Contact form — ${testPayload.name}`,
      html: `<p>SMTP test (${label}) OK.</p><p>${testPayload.message}</p>`,
      replyTo: testPayload.email,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

async function tryResend() {
  if (!resendKey || /x{4,}/i.test(resendKey)) {
    return { ok: false, error: "resend key missing or placeholder" };
  }
  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM?.trim() || "FGS Software <onboarding@resend.dev>";
  try {
    const result = await resend.emails.send({
      from,
      to: [inbox],
      subject: `[TEST Resend] Contact form — ${testPayload.name}`,
      html: `<p>Resend test OK.</p><p>${testPayload.message}</p>`,
      replyTo: testPayload.email,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

const smtpPrimary = await trySmtp("GMAIL_USER", gmailUser, gmailPass);
console.log("SMTP (GMAIL_USER):", smtpPrimary.ok ? "SUCCESS" : "FAILED");
if (!smtpPrimary.ok) console.log("  →", smtpPrimary.error);
else console.log("  → messageId:", smtpPrimary.messageId);

if (!smtpPrimary.ok && gmailUser !== "contact.fgssoftware@gmail.com") {
  const altPass = gmailPass;
  const alt = await trySmtp("contact.fgssoftware@gmail.com", "contact.fgssoftware@gmail.com", altPass);
  console.log("SMTP (contact.fgssoftware@gmail.com):", alt.ok ? "SUCCESS" : "FAILED");
  if (!alt.ok) console.log("  →", alt.error);
  else console.log("  → messageId:", alt.messageId);
}

const resendResult = await tryResend();
console.log("Resend:", resendResult.ok ? "SUCCESS" : "FAILED");
if (!resendResult.ok) console.log("  →", resendResult.error);
else console.log("  → id:", resendResult.id);
