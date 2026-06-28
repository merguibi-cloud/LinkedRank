/**
 * One-off migration: uploads files that only exist in the local `uploads/` folder
 * (saved there before SUPABASE_SERVICE_ROLE_KEY was configured) to Supabase Storage,
 * under their existing fileKey path. No DB rows need updating — imageUrl/fileUrl
 * resolution already rewrites localhost URLs to /api/media/<fileKey>, and that route
 * already checks Supabase Storage first. Uploading under the same key just makes that
 * lookup succeed instead of 404ing. uploadToSupabaseStorage upserts, so re-running this
 * is safe.
 *
 * Run with: npx tsx scripts/migrate-local-uploads-to-storage.ts [--dry-run]
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { uploadToSupabaseStorage } from "../server/lib/supabaseStorage";
import { ENV } from "../server/_core/env";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const DRY_RUN = process.argv.includes("--dry-run");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required to run this migration");
  }

  const files = await walk(UPLOADS_ROOT);
  console.log(`Found ${files.length} local file(s) under uploads/`);

  let uploaded = 0;
  let failed = 0;

  for (const filePath of files) {
    const fileKey = path.relative(UPLOADS_ROOT, filePath).split(path.sep).join("/");
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_BY_EXT[ext] ?? "application/octet-stream";

    if (DRY_RUN) {
      console.log(`  would upload: ${fileKey} (${mimeType})`);
      uploaded++;
      continue;
    }

    try {
      const buffer = await fs.readFile(filePath);
      const url = await uploadToSupabaseStorage(fileKey, buffer, mimeType);
      console.log(`  uploaded: ${fileKey} -> ${url}`);
      uploaded++;
    } catch (error) {
      console.error(`  FAILED: ${fileKey}:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`\nDone. uploaded=${uploaded} failed=${failed}${DRY_RUN ? " (dry run)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
