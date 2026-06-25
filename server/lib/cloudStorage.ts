import { put } from "@vercel/blob";
import { isServerlessDeployment } from "../_core/isServerless";
import { uploadToSupabaseStorage } from "./supabaseStorage";

export async function uploadCloudFile(
  fileKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const hasBlobAuth =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.BLOB_STORE_ID);
  const hasSupabase =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    Boolean(process.env.SUPABASE_URL);

  if (!isServerlessDeployment() && !hasBlobAuth && !hasSupabase) {
    throw new Error(
      "uploadCloudFile nécessite un runtime serverless ou BLOB_READ_WRITE_TOKEN / SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  if (hasBlobAuth) {
    try {
      const { url } = await put(fileKey, buffer, {
        access: "public",
        contentType: mimeType,
        addRandomSuffix: false,
      });
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[cloudStorage] Vercel Blob échoué : ${message}`);
    }
  }

  return uploadToSupabaseStorage(fileKey, buffer, mimeType);
}
