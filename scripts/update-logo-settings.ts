import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { key: "site_logo_url", value: "/logo.png" },
    { key: "site_logo_url_backup", value: "/logo.png" },
    { key: "site_logo_mode", value: "image" },
  ];

  for (const { key, value } of updates) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`Updated ${key}=${value}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
