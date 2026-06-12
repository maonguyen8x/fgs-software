import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveContactInboxEmail, sendContactEmails } from "@/lib/email";
import { isEmailConfigActive, resolveEmailConfig } from "@/lib/email/config";
import { getSettingsMap } from "@/lib/settings";

export async function POST() {
  const { error, session } = await requireAdminSession();
  if (error) return error;

  const settings = await getSettingsMap();
  const config = resolveEmailConfig(settings);

  if (!isEmailConfigActive(config)) {
    return NextResponse.json(
      {
        success: false,
        error: "Email is not configured. Save settings or import from server environment.",
      },
      { status: 400 }
    );
  }

  const inbox = resolveContactInboxEmail(settings);
  const adminEmail = session?.user?.email ?? inbox;

  const result = await sendContactEmails(
    {
      name: "FGS Admin Test",
      email: adminEmail,
      message:
        "This is a test email from Admin → Email settings. Contact form delivery is working.",
    },
    inbox,
    settings.admin_email_cc,
    settings
  );

  if (!result.adminSent) {
    return NextResponse.json(
      {
        success: false,
        error: result.error ?? "Send failed",
        code: result.code,
        provider: result.provider,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    provider: result.provider,
    inbox,
    replySent: result.replySent,
  });
}
