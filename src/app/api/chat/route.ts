import { z } from "zod";
import { prisma } from "@/lib/db";
import { AiChatUnavailableError, generateChatReply } from "@/lib/chat/ai";
import { getSettingsMap } from "@/lib/settings";
import type { Locale } from "@/i18n/routing";
import {
  apiSuccess,
  apiValidationError,
  apiServerError,
  apiError,
} from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { sanitizeEmail, sanitizeText } from "@/lib/security/sanitize";

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  locale: z.enum(["en", "ja", "vi"]),
  message: z.string().min(1).max(2000),
  visitorName: z.string().max(100).optional(),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const body = chatSchema.parse(await request.json());
    const locale = body.locale as Locale;
    const message = sanitizeText(body.message, 2000);

    const settings = await getSettingsMap();
    const assistantName = settings.chatbot_name ?? "Nova";
    const enabled = settings.chatbot_enabled !== "false";

    if (!enabled) {
      return apiError("Chatbot is disabled", 503, "SERVICE_UNAVAILABLE");
    }

    await prisma.chatSession.upsert({
      where: { sessionId: body.sessionId },
      update: {
        locale,
        visitorName: body.visitorName ? sanitizeText(body.visitorName, 100) : undefined,
        email: body.email ? sanitizeEmail(body.email) : undefined,
        updatedAt: new Date(),
      },
      create: {
        sessionId: body.sessionId,
        locale,
        visitorName: body.visitorName ? sanitizeText(body.visitorName, 100) : undefined,
        email: body.email ? sanitizeEmail(body.email) : undefined,
      },
    });

    await prisma.chatMessage.create({
      data: { sessionId: body.sessionId, role: "user", content: message },
    });

    const history = await prisma.chatMessage.findMany({
      where: { sessionId: body.sessionId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const turns = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    let reply: string;
    try {
      reply = await generateChatReply({ locale, messages: turns, assistantName });
    } catch (error) {
      if (error instanceof AiChatUnavailableError) {
        logger.error("Chat AI unavailable", { error: error.message });
        return apiError(
          "AI service is temporarily unavailable. Please try again or use the Contact page.",
          503,
          "AI_UNAVAILABLE"
        );
      }
      throw error;
    }

    await prisma.chatMessage.create({
      data: { sessionId: body.sessionId, role: "assistant", content: reply },
    });

    return apiSuccess({ reply, assistantName });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiValidationError("Invalid request");
    }
    logger.error("Chat API error", { error: String(error) });
    return apiServerError("Failed to process message");
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId || !z.string().uuid().safeParse(sessionId).success) {
      return apiValidationError("Invalid sessionId");
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return apiSuccess({
      messages: messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
    });
  } catch (error) {
    logger.error("Chat history API error", { error: String(error) });
    return apiServerError();
  }
}
