/** Database setting keys for contact / transactional email (admin-configurable). */
export const EMAIL_SETTING_KEYS = [
  "email_contact_inbox",
  "email_gmail_user",
  "email_gmail_app_password",
  "email_gmail_from",
  "email_smtp_host",
  "email_smtp_port",
  "email_smtp_secure",
  "email_resend_api_key",
  "email_resend_from",
] as const;

export type EmailSettingKey = (typeof EMAIL_SETTING_KEYS)[number];

export const EMAIL_SECRET_KEYS: EmailSettingKey[] = [
  "email_gmail_app_password",
  "email_resend_api_key",
];

/** Maps DB setting key → process.env keys (first non-empty wins). */
export const EMAIL_ENV_MAP: Record<EmailSettingKey, string[]> = {
  email_contact_inbox: ["CONTACT_ADMIN_EMAIL", "ADMIN_EMAIL"],
  email_gmail_user: ["GMAIL_USER", "SMTP_USER"],
  email_gmail_app_password: ["GMAIL_APP_PASSWORD", "SMTP_PASSWORD"],
  email_gmail_from: ["GMAIL_FROM", "SMTP_FROM"],
  email_smtp_host: ["SMTP_HOST"],
  email_smtp_port: ["SMTP_PORT"],
  email_smtp_secure: ["SMTP_SECURE"],
  email_resend_api_key: ["RESEND_API_KEY"],
  email_resend_from: ["RESEND_FROM"],
};
