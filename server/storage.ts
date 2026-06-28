import fs from "fs/promises";
import path from "path";
import { isServerlessDeployment } from "./_core/isServerless";
import { getPublicBaseUrl } from "./_core/publicUrl";
import {
  uploadToSupabaseStorage,
  getStorageBucket,
  getAdminClient,
} from "./lib/supabaseStorage";

type StorageConfig = { baseUrl: string; apiKey: string };

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function getForgeStorageConfig(): StorageConfig {
  const baseUrl =
    process.env.BUILT_IN_FORGE_API_URL ?? process.env.OPENAI_API_URL ?? "";
  const apiKey =
    process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "";

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function storagePutLocal(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const filePath = path.resolve(process.cwd(), "uploads", key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, data);

  return {
    key,
    url: `${getPublicBaseUrl()}/uploads/${key}`,
  };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", relKey);
  return url;
}

function toFormData(
  data: Buffer,
  contentType: string,
  fileName: string
): FormData {
  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

async function storagePutForge(
  key: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getForgeStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: toFormData(data, contentType, key.split("/").pop() ?? key),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }

  const url = (await response.json()).url;
  return { key, url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const buffer = Buffer.isBuffer(data)
    ? data
    : typeof data === "string"
      ? Buffer.from(data)
      : Buffer.from(data);

  if (isServerlessDeployment()) {
    const url = await uploadToSupabaseStorage(key, buffer, contentType);
    return { key, url };
  }

  if (process.env.BUILT_IN_FORGE_API_URL) {
    return storagePutForge(key, buffer, contentType);
  }

  return storagePutLocal(key, buffer, contentType);
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (isServerlessDeployment()) {
    const supabase = getAdminClient();
    const { data } = supabase.storage.from(getStorageBucket()).getPublicUrl(key);
    return { key, url: data.publicUrl };
  }

  return {
    key,
    url: `${getPublicBaseUrl()}/uploads/${key}`,
  };
}
