import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { saveUploadedVideo } from "@/lib/admin/upload-video";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ code: "NO_FILE" }, { status: 400 });
    }
    const url = await saveUploadedVideo(file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UPLOAD_FAILED";
    logger.error("Admin video upload failed", { message });
    if (message === "INVALID_TYPE") {
      return NextResponse.json({ code: "INVALID_TYPE" }, { status: 400 });
    }
    if (message === "FILE_TOO_LARGE") {
      return NextResponse.json({ code: "FILE_TOO_LARGE" }, { status: 400 });
    }
    return NextResponse.json({ code: "UPLOAD_FAILED" }, { status: 500 });
  }
}
