import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "../_core/env";

const DEFAULT_BUCKET = "media";

function getAdminClient(): SupabaseClient {
  const url = ENV.supabaseUrl;
  const key = ENV.supabaseServiceRoleKey;

  if (!url || !key) {
    throw new Error(
      "Stockage cloud indisponible : ajoutez SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API → service_role)."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
}

export async function uploadToSupabaseStorage(
  fileKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const supabase = getAdminClient();
  const bucket = getStorageBucket();

  const { error } = await supabase.storage.from(bucket).upload(fileKey, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload Supabase échoué : ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileKey);
  return data.publicUrl;
}

export async function deleteFromSupabaseStorage(fileKey: string): Promise<void> {
  const supabase = getAdminClient();
  const bucket = getStorageBucket();
  await supabase.storage.from(bucket).remove([fileKey]);
}
