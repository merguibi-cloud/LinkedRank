import { ENV } from "./env";
import { isServerlessDeployment } from "./isServerless";

const DEFAULT_STORAGE_BUCKET = "media";
const PROD_FALLBACK_URL = "https://www.linkedrank.fr";

/** URL publique de l'app (jamais localhost en production). */
export function getPublicBaseUrl(): string {
  if (ENV.appUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(ENV.appUrl)) {
    return ENV.appUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (isServerlessDeployment() || ENV.isProduction) {
    return PROD_FALLBACK_URL;
  }
  return "http://localhost:3000";
}

function getStorageBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_STORAGE_BUCKET;
}

/** URL publique Supabase / disque local à partir d'une clé de stockage. */
export function resolvePublicUrlForKey(key: string): string {
  const normalized = key.replace(/^\/+/, "");
  if (isServerlessDeployment() && ENV.supabaseUrl) {
    const base = ENV.supabaseUrl.replace(/\/$/, "");
    return `${base}/storage/v1/object/public/${getStorageBucketName()}/${normalized}`;
  }
  return `${getPublicBaseUrl()}/uploads/${normalized}`;
}

/** Réécrit les URLs localhost ou relatives vers l'URL publique de production. */
export function resolvePublicUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    const path = url.replace(/^https?:\/\/[^/]+/i, "");
    return `${getPublicBaseUrl()}${path}`;
  }
  if (url.startsWith("/")) {
    return `${getPublicBaseUrl()}${url}`;
  }
  return url;
}

function extractMediaKeyFromUrl(url: string): string | null {
  const match = url.match(/\/api\/media\/(.+)$/i);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1].split("?")[0]);
}

function isLocalOrRelativeAssetUrl(url: string): boolean {
  return (
    /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url) ||
    url.startsWith("/uploads/") ||
    url.startsWith("/api/media/")
  );
}

/** URL proxy qui sert le fichier depuis Blob, Supabase ou le disque local. */
export function buildMediaProxyUrl(fileKey: string): string {
  const segments = fileKey
    .replace(/^\/+/, "")
    .split("/")
    .map((s) => encodeURIComponent(s));
  return `${getPublicBaseUrl()}/api/media/${segments.join("/")}`;
}

/** Résout imageUrl + repli sur imageKey si l'URL est absente ou invalide. */
export function resolveStorageAssetUrl(
  imageUrl: string | null | undefined,
  imageKey?: string | null
): string | null {
  const key = imageKey?.trim();

  if (imageUrl) {
    const fromProxy = extractMediaKeyFromUrl(imageUrl);
    if (fromProxy) {
      return buildMediaProxyUrl(fromProxy);
    }

    if (!isLocalOrRelativeAssetUrl(imageUrl)) {
      return resolvePublicUrl(imageUrl);
    }

    const uploadPath = imageUrl.match(/\/uploads\/(.+)$/);
    if (uploadPath?.[1]) {
      return buildMediaProxyUrl(decodeURIComponent(uploadPath[1]));
    }
  }

  if (key) {
    return buildMediaProxyUrl(key);
  }

  return null;
}

/** Normalise les champs image avant écriture en base. */
export function normalizeStoredImageFields(
  imageUrl: string | null | undefined,
  imageKey?: string | null
): { imageUrl: string | null; imageKey: string | null } {
  const key = imageKey?.trim() || null;
  return {
    imageKey: key,
    imageUrl: resolveStorageAssetUrl(imageUrl, key),
  };
}

export function resolvePublicUrls(urls: string[]): string[] {
  return urls.map(resolvePublicUrl);
}
