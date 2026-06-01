import { PrismaClient } from "@prisma/client";
import { normalizeGeminiModel } from "../src/lib/chat/providers/gemini";

const prisma = new PrismaClient();

async function main() {
  const geminiModel = normalizeGeminiModel("gemini-2.0-flash");

  await prisma.setting.upsert({
    where: { key: "gemini_model" },
    update: { value: geminiModel },
    create: { key: "gemini_model", value: geminiModel },
  });

  await prisma.setting.upsert({
    where: { key: "ai_provider" },
    update: { value: "auto" },
    create: { key: "ai_provider", value: "auto" },
  });

  const geminiRows = await prisma.aiProvider.findMany({ where: { providerType: "gemini" } });
  for (const row of geminiRows) {
    await prisma.aiProvider.update({
      where: { id: row.id },
      data: { model: normalizeGeminiModel(row.model), isEnabled: true },
    });
    console.log("Updated aiProvider gemini model ->", normalizeGeminiModel(row.model));
  }

  console.log("Synced gemini_model=", geminiModel, "ai_provider=auto");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
