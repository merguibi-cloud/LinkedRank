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
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

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

/**
 * Register an image upload with LinkedIn
 * Returns the upload URL and asset URN
 */
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
  const uploadMechanism = data.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"];
  
  if (!uploadMechanism?.uploadUrl) {
    throw new Error("No upload URL returned from LinkedIn");
  }

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    asset: data.value?.asset,
  };
}

/**
 * Upload an image to LinkedIn
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  uploadUrl: string,
  imageUrl: string
): Promise<void> {
  // Download the image from the URL with timeout and retry
  console.log("[LinkedIn] Downloading image from:", imageUrl);
  
  let imageBuffer: ArrayBuffer;
  let contentType = "image/png";
  
  // Try to download with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const imageResponse = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "LinkedIn-Image-Upload/1.0",
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      imageBuffer = await imageResponse.arrayBuffer();
      contentType = imageResponse.headers.get("content-type") || "image/png";
      console.log(`[LinkedIn] Image downloaded successfully (${imageBuffer.byteLength} bytes, ${contentType})`);
      break;
    } catch (downloadError) {
      console.error(`[LinkedIn] Download attempt ${attempt} failed:`, downloadError);
      if (attempt === 3) {
        throw new Error(`Failed to download image after 3 attempts: ${downloadError}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // Upload to LinkedIn with retry
  console.log("[LinkedIn] Uploading image to LinkedIn...");
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for upload
      
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": contentType,
        },
        body: imageBuffer!,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        throw new Error(`LinkedIn upload failed: ${uploadResponse.status} - ${error}`);
      }
      
      console.log("[LinkedIn] Image uploaded successfully to LinkedIn");
      return;
    } catch (uploadError) {
      console.error(`[LinkedIn] Upload attempt ${attempt} failed:`, uploadError);
      if (attempt === 3) {
        throw new Error(`Failed to upload image to LinkedIn after 3 attempts: ${uploadError}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

/**
 * Post content to LinkedIn with optional image
 * Uses the UGC Post API (User Generated Content)
 */
export async function postToLinkedIn(
  accessToken: string,
  authorId: string,
  content: string,
  imageUrl?: string
): Promise<LinkedInPostResult> {
  try {
    let mediaAsset: string | null = null;

    // If there's an image, upload it first - this is REQUIRED if image is provided
    if (imageUrl) {
      console.log("[LinkedIn] Image URL provided, uploading is required...");
      console.log("[LinkedIn] Registering image upload...");
      const { uploadUrl, asset } = await registerImageUpload(accessToken, authorId);
      
      console.log("[LinkedIn] Uploading image to LinkedIn servers...");
      await uploadImageToLinkedIn(accessToken, uploadUrl, imageUrl);
      
      mediaAsset = asset;
      console.log("[LinkedIn] Image uploaded successfully, asset:", asset);
    }

    // Build the post payload
    const postPayload: any = {
      author: `urn:li:person:${authorId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: mediaAsset ? "IMAGE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    // Add media if we have an uploaded asset
    if (mediaAsset) {
      postPayload.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          media: mediaAsset,
        },
      ];
    }

    console.log("[LinkedIn] Posting to LinkedIn...");
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
