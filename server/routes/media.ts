import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { head } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { mediaLibrary } from "../../drizzle/schema";
import { getStorageBucket } from "../lib/supabaseStorage";

const router = Router();

function mimeFromKey(fileKey: string): string {
  const ext = path.extname(fileKey).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

async function serveFromVercelBlob(
  fileKey: string,
  res: Response
): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return false;

  try {
    const meta = await head(fileKey, { token });
    const remote = await fetch(meta.url);
    if (!remote.ok) return false;

    const buffer = Buffer.from(await remote.arrayBuffer());
    res.setHeader("Content-Type", meta.contentType || mimeFromKey(fileKey));
    res.send(buffer);
    return true;
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name !== "BlobNotFoundError") {
      console.error("[media] Vercel Blob:", err);
    }
    return false;
  }
}

function isFetchableCloudUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/localhost|127\.0\.0\.1/i.test(url)) return false;
  return true;
}

router.use(async (req: Request, res: Response) => {
  const fileKey = decodeURIComponent(req.path.replace(/^\//, ""));
  if (!fileKey || fileKey.includes("..")) {
    return res.status(400).json({ error: "Chemin invalide" });
  }

  res.setHeader("Cache-Control", "public, max-age=86400");

  if (ENV.supabaseUrl && ENV.supabaseServiceRoleKey) {
    try {
      const supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabase.storage
        .from(getStorageBucket())
        .download(fileKey);

      if (!error && data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        res.setHeader("Content-Type", mimeFromKey(fileKey));
        return res.send(buffer);
      }
    } catch (err) {
      console.error("[media] Supabase download failed:", err);
    }
  }

  const localPath = path.resolve(process.cwd(), "uploads", fileKey);
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  if (localPath.startsWith(uploadsRoot) && fs.existsSync(localPath)) {
    res.setHeader("Content-Type", mimeFromKey(fileKey));
    return res.sendFile(localPath);
  }

  if (await serveFromVercelBlob(fileKey, res)) {
    return;
  }

  try {
    const db = await getDb();
    if (db) {
      const [row] = await db
        .select({ fileUrl: mediaLibrary.fileUrl })
        .from(mediaLibrary)
        .where(eq(mediaLibrary.fileKey, fileKey))
        .limit(1);

      const cloudUrl = row?.fileUrl;
      if (cloudUrl && isFetchableCloudUrl(cloudUrl)) {
        const remote = await fetch(cloudUrl);
        if (remote.ok) {
          const buffer = Buffer.from(await remote.arrayBuffer());
          res.setHeader("Content-Type", mimeFromKey(fileKey));
          return res.send(buffer);
        }
      }
    }
  } catch (err) {
    console.error("[media] Cloud fetch failed:", err);
  }

  return res.status(404).json({ error: "Fichier introuvable" });
});

export default router;
