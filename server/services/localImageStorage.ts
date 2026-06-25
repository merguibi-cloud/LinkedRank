import fs from "fs/promises";
import path from "path";
import { getPublicBaseUrl } from "../_core/publicUrl";
import { isServerlessDeployment } from "../_core/isServerless";
import { uploadCloudFile } from "../lib/cloudStorage";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "generated");

export async function saveImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `generated/${safeName}`;

  if (isServerlessDeployment()) {
    return uploadCloudFile(fileKey, buffer, "image/png");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), buffer);

  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/uploads/generated/${safeName}`;
}
