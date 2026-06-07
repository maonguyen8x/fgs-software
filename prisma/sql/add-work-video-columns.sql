-- Run once if prisma db push is unavailable (adds Work video columns from schema update)
ALTER TABLE "Work" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "Work" ADD COLUMN IF NOT EXISTS "videoSource" TEXT;
