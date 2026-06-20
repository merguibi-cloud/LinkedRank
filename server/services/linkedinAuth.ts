import type { LinkedInProfile, LinkedInTokens } from "./linkedin";

export function buildLinkedInSettingsPayload(
  profile: LinkedInProfile,
  tokens: LinkedInTokens
) {
  return {
    linkedinUserId: profile.sub,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? null,
    tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    profileName: profile.name,
    profilePicture: profile.picture ?? null,
    email: profile.email ?? null,
    profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
    isConnected: true,
  };
}

export function formatLinkedInStatus(settings?: {
  isConnected?: boolean | null;
  accessToken?: string | null;
  profileName?: string | null;
  profilePicture?: string | null;
  email?: string | null;
  profileUrl?: string | null;
  linkedinUserId?: string | null;
  tokenExpiresAt?: Date | null;
  updatedAt?: Date | null;
}) {
  const connected = Boolean(
    settings?.isConnected && settings?.accessToken && settings?.linkedinUserId
  );

  return {
    connected,
    profileName: settings?.profileName ?? null,
    profilePicture: settings?.profilePicture ?? null,
    email: settings?.email ?? null,
    profileUrl: settings?.profileUrl ?? null,
    linkedinUserId: settings?.linkedinUserId ?? null,
    tokenExpiresAt: settings?.tokenExpiresAt ?? null,
    lastSync: settings?.updatedAt ?? null,
  };
}
