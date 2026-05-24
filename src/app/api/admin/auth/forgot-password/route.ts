import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const GENERIC_SUCCESS = {
  message: "If an account exists for this email, a reset link has been sent.",
};

export async function POST(request: Request) {
  try {
    const { email: rawEmail } = schema.parse(await request.json());
    const email = rawEmail.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.passwordResetToken.create({
        data: { email: user.email, token, expiresAt },
      });

      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    return NextResponse.json(GENERIC_SUCCESS);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ code: "EMAIL_INVALID" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to process request. Please try again." }, { status: 500 });
  }
}
