import fs from "fs/promises";
import path from "path";
import { ENV } from "../_core/env";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "generated");

export async function saveImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), buffer);

  const baseUrl = (ENV.appUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}/uploads/generated/${safeName}`;
}
