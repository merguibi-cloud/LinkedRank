/** Réécrit les URLs localhost/relatives pour l'affichage dans le navigateur. */
export function resolveDisplayImageUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    const path = url.replace(/^https?:\/\/[^/]+/i, "");
    return `${window.location.origin}${path}`;
  }
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}
