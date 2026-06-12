import {
  EMAIL_ENV_MAP,
  EMAIL_SETTING_KEYS,
  type EmailSettingKey,
} from "@/lib/email/setting-keys";

export const DEFAULT_CONTACT_INBOX = "contact.fgssoftware@gmail.com";

export interface ResolvedEmailConfig {
  contactInbox: string;
  gmailUser: string;
  gmailAppPassword: string;
  gmailFrom: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  resendApiKey: string;
  resendFrom: string;
}

function pickValue(
  settings: Record<string, string> | undefined,
  key: EmailSettingKey
): string {
  const fromDb = settings?.[key]?.trim();
  if (fromDb) return fromDb;

  for (const envKey of EMAIL_ENV_MAP[key]) {
    const envVal = process.env[envKey]?.trim();
    if (envVal) return envVal;
  }
  return "";
}

function isPlaceholderApiKey(value: string): boolean {
  if (!value) return true;
  return /x{4,}/i.test(value) || value === "re_xxxxxxxxxxxx" || value === "sk-xxxxxxxx";
}

export function resolveEmailConfig(
  settings?: Record<string, string>
): ResolvedEmailConfig {
  const gmailAppPassword = pickValue(settings, "email_gmail_app_password").replace(/\s/g, "");

  return {
    contactInbox:
      pickValue(settings, "email_contact_inbox") ||
      settings?.admin_email?.trim() ||
      DEFAULT_CONTACT_INBOX,
    gmailUser: pickValue(settings, "email_gmail_user"),
    gmailAppPassword,
    gmailFrom: pickValue(settings, "email_gmail_from"),
    smtpHost: pickValue(settings, "email_smtp_host"),
    smtpPort: Number(pickValue(settings, "email_smtp_port") || 587),
    smtpSecure: pickValue(settings, "email_smtp_secure") === "true",
    resendApiKey: pickValue(settings, "email_resend_api_key"),
    resendFrom: pickValue(settings, "email_resend_from"),
  };
}

export function resolveContactInboxFromConfig(
  settings: Record<string, string> | undefined,
  config: ResolvedEmailConfig
): string {
  return (
    config.contactInbox ||
    settings?.admin_email?.trim() ||
    DEFAULT_CONTACT_INBOX
  );
}

export function isEmailConfigActive(config: ResolvedEmailConfig): boolean {
  const smtpReady = Boolean(config.gmailUser && config.gmailAppPassword);
  const resendReady = Boolean(config.resendApiKey && !isPlaceholderApiKey(config.resendApiKey));
  return smtpReady || resendReady;
}

export function getEmailSettingKeysForExport(): readonly EmailSettingKey[] {
  return EMAIL_SETTING_KEYS;
}
