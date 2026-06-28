/**
 * LinkedIn API Integration Service
 * 
 * This service handles LinkedIn OAuth and posting functionality.
 * 
 * LinkedIn API Requirements:
 * 1. Create a LinkedIn App at https://www.linkedin.com/developers/
 * 2. Request "Share on LinkedIn" and "Sign In with LinkedIn" products
 * 3. Add OAuth 2.0 redirect URL
 * 4. Get Client ID and Client Secret
 * 
 * Scopes needed:
 * - openid (for authentication)
 * - profile (for user info)
 * - w_member_social (for posting)
 */

import { ENV } from "../_core/env";

// LinkedIn API endpoints
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_API_URL = "https://api.linkedin.com/v2";
const LINKEDIN_REST_API_URL = "https://api.linkedin.com/rest";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
/** Version REST LinkedIn (YYYYMM) — requis pour Documents / Posts API */
const DEFAULT_LINKEDIN_API_VERSION = "202606";

function resolveLinkedInApiVersion(): string {
  const raw = process.env.LINKEDIN_API_VERSION?.trim();
  if (!raw) return DEFAULT_LINKEDIN_API_VERSION;
  // Format attendu : YYYYMM (6 chiffres). YYYYMMDD → tronquer.
  if (/^\d{6}$/.test(raw)) return raw;
  if (/^\d{8}$/.test(raw)) return raw.slice(0, 6);
  console.warn(
    `[LinkedIn] LINKEDIN_API_VERSION invalide "${raw}", utilisation de ${DEFAULT_LINKEDIN_API_VERSION}`
  );
  return DEFAULT_LINKEDIN_API_VERSION;
}

const LINKEDIN_API_VERSION = resolveLinkedInApiVersion();

function linkedInRestHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    "Linkedin-Version": LINKEDIN_API_VERSION,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LinkedInTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface LinkedInProfile {
  sub: string; // LinkedIn member ID
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email?: string;
}

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface LinkedInPostMediaOptions {
  imageUrl?: string;
  pdfUrl?: string;
  documentTitle?: string;
}

function normalizePostMedia(
  media?: string | LinkedInPostMediaOptions
): LinkedInPostMediaOptions {
  if (!media) return {};
  if (typeof media === "string") return { imageUrl: media };
  return media;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    throw new Error("LINKEDIN_CLIENT_ID not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: "openid profile w_member_social email",
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<LinkedInTokens> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn credentials not configured");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
  };
}

/**
 * Fallback : récupère la photo via l'API profil classique si userinfo ne la fournit pas.
 */
async function fetchLinkedInProfilePicture(
  accessToken: string
): Promise<string | undefined> {
  try {
    const url = `${LINKEDIN_API_URL}/me?projection=(profilePicture(displayImage~:playableStreams))`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.ok) {
      console.warn("[LinkedIn] Profile picture API failed:", await response.text());
      return undefined;
    }

    const data = await response.json();
    const elements = data.profilePicture?.["displayImage~"]?.elements as
      | Array<{ identifiers?: Array<{ identifier?: string }> }>
      | undefined;

    if (!elements?.length) return undefined;

    const largest = elements[elements.length - 1];
    return largest?.identifiers?.[0]?.identifier;
  } catch (error) {
    console.warn("[LinkedIn] Profile picture fetch error:", error);
    return undefined;
  }
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfile> {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LinkedIn profile: ${error}`);
  }

  const profile: LinkedInProfile = await response.json();

  if (!profile.picture) {
    const picture = await fetchLinkedInProfilePicture(accessToken);
    if (picture) {
      profile.picture = picture;
      console.log("[LinkedIn] Profile picture resolved via fallback API");
    }
  }

  return profile;
}

async function initializeDocumentUpload(
  accessToken: string,
  authorId: string
): Promise<{ uploadUrl: string; documentUrn: string }> {
  const response = await fetch(
    `${LINKEDIN_REST_API_URL}/documents?action=initializeUpload`,
    {
      method: "POST",
      headers: linkedInRestHeaders(accessToken),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: `urn:li:person:${authorId}`,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to initialize document upload: ${error}`);
  }

  const data = await response.json();
  const uploadUrl = data.value?.uploadUrl as string | undefined;
  const documentUrn = data.value?.document as string | undefined;

  if (!uploadUrl || !documentUrn) {
    throw new Error("No upload URL or document URN returned from LinkedIn");
  }

  return { uploadUrl, documentUrn };
}

async function waitForDocumentReady(
  accessToken: string,
  documentUrn: string
): Promise<void> {
  const encodedUrn = encodeURIComponent(documentUrn);

  for (let attempt = 1; attempt <= 12; attempt++) {
    const response = await fetch(
      `${LINKEDIN_REST_API_URL}/documents/${encodedUrn}`,
      { headers: linkedInRestHeaders(accessToken) }
    );

    if (!response.ok) {
      console.warn("[LinkedIn] Document status check failed:", await response.text());
      await sleep(1500);
      continue;
    }

    const doc = (await response.json()) as { status?: string };
    console.log(`[LinkedIn] Document status (attempt ${attempt}):`, doc.status);

    if (doc.status === "AVAILABLE") return;
    if (doc.status === "PROCESSING_FAILED") {
      throw new Error("LinkedIn document processing failed");
    }

    await sleep(1500);
  }

  console.warn("[LinkedIn] Document not AVAILABLE yet, attempting post anyway");
}

async function postDocumentCarouselToLinkedIn(
  accessToken: string,
  authorId: string,
  content: string,
  documentUrn: string,
  documentTitle: string
): Promise<LinkedInPostResult> {
  const title = (documentTitle || "Carrousel LinkedIn").slice(0, 200);

  const response = await fetch(`${LINKEDIN_REST_API_URL}/posts`, {
    method: "POST",
    headers: linkedInRestHeaders(accessToken),
    body: JSON.stringify({
      author: `urn:li:person:${authorId}`,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          title,
          id: documentUrn,
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to post document: ${error}` };
  }

  const postId =
    response.headers.get("x-restli-id") ||
    response.headers.get("x-linkedin-id") ||
    undefined;

  return { success: true, postId };
}

async function publishPdfCarousel(
  accessToken: string,
  authorId: string,
  content: string,
  pdfUrl: string,
  documentTitle?: string
): Promise<LinkedInPostResult> {
  console.log("[LinkedIn] PDF URL provided, uploading via Documents API...");
  const { uploadUrl, documentUrn } = await initializeDocumentUpload(
    accessToken,
    authorId
  );
  await uploadDocumentToLinkedIn(accessToken, uploadUrl, pdfUrl);
  console.log("[LinkedIn] PDF uploaded, document URN:", documentUrn);
  await waitForDocumentReady(accessToken, documentUrn);
  return postDocumentCarouselToLinkedIn(
    accessToken,
    authorId,
    content,
    documentUrn,
    documentTitle || "Carrousel LinkedIn"
  );
}

async function downloadRemoteFile(
  fileUrl: string,
  logLabel: string
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  console.log(`[LinkedIn] Downloading ${logLabel} from:`, fileUrl);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      const response = await fetch(fileUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "LinkedIn-Media-Upload/1.0" },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to download ${logLabel}: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      const contentType =
        response.headers.get("content-type") ||
        (logLabel === "document" ? "application/pdf" : "image/png");
      console.log(
        `[LinkedIn] ${logLabel} downloaded (${buffer.byteLength} bytes, ${contentType})`
      );
      return { buffer, contentType };
    } catch (downloadError) {
      console.error(`[LinkedIn] ${logLabel} download attempt ${attempt} failed:`, downloadError);
      if (attempt === 3) {
        throw new Error(
          `Failed to download ${logLabel} after 3 attempts: ${downloadError}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(`Failed to download ${logLabel}`);
}

async function uploadBytesToLinkedIn(
  accessToken: string,
  uploadUrl: string,
  buffer: ArrayBuffer,
  contentType: string,
  logLabel: string
): Promise<void> {
  console.log(`[LinkedIn] Uploading ${logLabel} to LinkedIn...`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60_000);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": contentType,
        },
        body: buffer,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        throw new Error(
          `LinkedIn ${logLabel} upload failed: ${uploadResponse.status} - ${error}`
        );
      }

      console.log(`[LinkedIn] ${logLabel} uploaded successfully to LinkedIn`);
      return;
    } catch (uploadError) {
      console.error(`[LinkedIn] ${logLabel} upload attempt ${attempt} failed:`, uploadError);
      if (attempt === 3) {
        throw new Error(
          `Failed to upload ${logLabel} to LinkedIn after 3 attempts: ${uploadError}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function registerImageUpload(
  accessToken: string,
  authorId: string
): Promise<{ uploadUrl: string; asset: string }> {
  const registerPayload = {
    registerUploadRequest: {
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      owner: `urn:li:person:${authorId}`,
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
    },
  };

  const response = await fetch(`${LINKEDIN_API_URL}/assets?action=registerUpload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(registerPayload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to register image upload: ${error}`);
  }

  const data = await response.json();
  const uploadMechanism =
    data.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];

  if (!uploadMechanism?.uploadUrl) {
    throw new Error("No upload URL returned from LinkedIn");
  }

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    asset: data.value?.asset,
  };
}

async function uploadImageToLinkedIn(
  accessToken: string,
  uploadUrl: string,
  imageUrl: string
): Promise<void> {
  const { buffer, contentType } = await downloadRemoteFile(imageUrl, "image");
  await uploadBytesToLinkedIn(accessToken, uploadUrl, buffer, contentType, "image");
}

async function uploadDocumentToLinkedIn(
  accessToken: string,
  uploadUrl: string,
  pdfUrl: string
): Promise<void> {
  const { buffer, contentType } = await downloadRemoteFile(pdfUrl, "document");
  await uploadBytesToLinkedIn(
    accessToken,
    uploadUrl,
    buffer,
    contentType.includes("pdf") ? contentType : "application/pdf",
    "document"
  );
}

/**
 * Post content to LinkedIn with optional image or PDF carousel document.
 * Uses the UGC Post API (User Generated Content).
 */
export async function postToLinkedIn(
  accessToken: string,
  authorId: string,
  content: string,
  media?: string | LinkedInPostMediaOptions
): Promise<LinkedInPostResult> {
  try {
    const { imageUrl, pdfUrl, documentTitle } = normalizePostMedia(media);

    if (pdfUrl) {
      return await publishPdfCarousel(
        accessToken,
        authorId,
        content,
        pdfUrl,
        documentTitle
      );
    }

    let mediaAsset: string | null = null;
    let shareMediaCategory: "NONE" | "IMAGE" = "NONE";
    let mediaPayload: Record<string, unknown>[] | undefined;

    if (imageUrl) {
      console.log("[LinkedIn] Image URL provided, uploading...");
      const { uploadUrl, asset } = await registerImageUpload(accessToken, authorId);
      await uploadImageToLinkedIn(accessToken, uploadUrl, imageUrl);
      mediaAsset = asset;
      shareMediaCategory = "IMAGE";
      mediaPayload = [{ status: "READY", media: mediaAsset }];
      console.log("[LinkedIn] Image uploaded successfully, asset:", asset);
    }

    const postPayload: Record<string, unknown> = {
      author: `urn:li:person:${authorId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory,
          ...(mediaPayload ? { media: mediaPayload } : {}),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    console.log("[LinkedIn] Posting to LinkedIn (ugcPosts)...");
    const response = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LinkedIn post error:", error);
      return {
        success: false,
        error: `Failed to post: ${error}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      postId: result.id,
    };
  } catch (error) {
    console.error("LinkedIn post exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if LinkedIn integration is configured
 */
export function isLinkedInConfigured(): boolean {
  return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}
