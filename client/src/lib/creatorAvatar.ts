function extractLinkedInUsername(linkedinUrl?: string | null): string | null {
  if (!linkedinUrl) return null;
  const match = linkedinUrl.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCreatorAvatarUrl(options: {
  profilePicture?: string | null;
  linkedinUsername?: string | null;
  linkedinUrl?: string | null;
  name: string;
}): string {
  return getCreatorAvatarFallbacks(options)[0];
}

function isExpiredLinkedInCdn(url: string): boolean {
  return url.includes("media.licdn.com") || url.includes("licdn.com");
}

export function getCreatorAvatarFallbacks(options: {
  profilePicture?: string | null;
  linkedinUsername?: string | null;
  linkedinUrl?: string | null;
  name: string;
}): string[] {
  const urls: string[] = [];
  const username =
    options.linkedinUsername?.trim() ||
    extractLinkedInUsername(options.linkedinUrl);

  // Unavatar est plus fiable que les URLs LinkedIn CDN (expiration)
  if (username) {
    urls.push(`https://unavatar.io/linkedin/${encodeURIComponent(username)}`);
  }

  const pic = options.profilePicture?.trim();
  if (pic && pic.startsWith("http") && !isExpiredLinkedInCdn(pic)) {
    urls.push(pic);
  }

  urls.push(
    `https://ui-avatars.com/api/?name=${encodeURIComponent(options.name)}&background=6366f1&color=fff&size=256&bold=true`
  );

  return Array.from(new Set(urls));
}
