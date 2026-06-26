/**
 * Crée le bucket Supabase Storage public "media" si absent.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-supabase-storage.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

if (!url || !serviceKey) {
  console.error(
    "Variables requises : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY\n" +
      "Récupérez la clé service_role dans Supabase → Project Settings → API."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Impossible de lister les buckets :", listError.message);
  process.exit(1);
}

if (buckets.some((b) => b.name === bucket)) {
  console.log(`Bucket "${bucket}" déjà présent.`);
  process.exit(0);
}

const { error: createError } = await supabase.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 25 * 1024 * 1024,
});

if (createError) {
  console.error("Création du bucket échouée :", createError.message);
  process.exit(1);
}

console.log(`Bucket public "${bucket}" créé avec succès.`);
