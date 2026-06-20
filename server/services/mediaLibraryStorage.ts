import fs from "fs/promises";
import path from "path";
import { ENV } from "../_core/env";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "media-library");

const ALLOWED_MIME_TYPES: Record<string, "image" | "video" | "document"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
  "application/pdf": "document",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export function getMediaTypeFromMime(mimeType: string): "image" | "video" | "document" | null {
  return ALLOWED_MIME_TYPES[mimeType] ?? null;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

export async function saveMediaFile(
  buffer: Buffer,
  fileName: string,
  userId: number
): Promise<{ fileUrl: string; fileKey: string }> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux (max 25 Mo)");
  }

  const userDir = path.join(UPLOAD_DIR, String(userId));
  await fs.mkdir(userDir, { recursive: true });

  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await fs.writeFile(path.join(userDir, safeName), buffer);

  const baseUrl = (ENV.appUrl || "http://localhost:3000").replace(/\/$/, "");
  return {
    fileKey: `media-library/${userId}/${safeName}`,
    fileUrl: `${baseUrl}/uploads/media-library/${userId}/${safeName}`,
  };
}

export async function deleteMediaFile(fileKey: string): Promise<void> {
  const filePath = path.resolve(process.cwd(), "uploads", fileKey);
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  if (!filePath.startsWith(uploadsRoot)) return;

  try {
    await fs.unlink(filePath);
  } catch {
    // file may already be gone
  }
}
