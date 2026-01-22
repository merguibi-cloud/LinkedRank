import { Router } from "express";
import { nanoid } from "nanoid";
import {
  getLinkedInAuthUrl,
  exchangeCodeForTokens,
  getLinkedInProfile,
  postToLinkedIn,
  isLinkedInConfigured,
} from "../services/linkedin";
import { upsertLinkedinSettings, getLinkedinSettings } from "../db";

const router = Router();

// Store OAuth states temporarily (in production, use Redis or database)
const oauthStates = new Map<string, { userId: number; redirectUrl: string }>();

/**
 * Check if LinkedIn is configured
 */
router.get("/status", (req, res) => {
  res.json({
    configured: isLinkedInConfigured(),
    connected: false, // Will be updated based on user's stored tokens
  });
});

/**
 * Initiate LinkedIn OAuth flow
 */
router.get("/auth", (req, res) => {
  try {
    const userId = 1; // For now, hardcoded. In production, get from session
    const state = nanoid();
    
    // Get the base URL for redirect
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const redirectUri = `${protocol}://${host}/api/linkedin/callback`;
    
    // Store state for verification
    oauthStates.set(state, {
      userId,
      redirectUrl: req.query.redirect as string || "/dashboard",
    });

    // Clean up old states after 10 minutes
    setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);

    const authUrl = getLinkedInAuthUrl(redirectUri, state);
    
    // If format=json is requested, return JSON, otherwise redirect
    if (req.query.format === "json") {
      res.json({ authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    if (req.query.format === "json") {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to initiate LinkedIn auth",
      });
    } else {
      res.redirect(`/?linkedin_error=${encodeURIComponent("auth_init_failed")}`);
    }
  }
});

/**
 * LinkedIn OAuth callback
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/?linkedin_error=${encodeURIComponent(error as string)}`);
    }

    if (!code || !state) {
      return res.redirect("/?linkedin_error=missing_params");
    }

    // Verify state
    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      return res.redirect("/?linkedin_error=invalid_state");
    }

    oauthStates.delete(state as string);

    // Get the redirect URI (must match exactly)
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const redirectUri = `${protocol}://${host}/api/linkedin/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code as string, redirectUri);

    // Get user profile
    const profile = await getLinkedInProfile(tokens.accessToken);

    // Store tokens and profile in database
    await upsertLinkedinSettings(storedState.userId, {
      linkedinUserId: profile.sub,
      accessToken: tokens.accessToken,
      tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      profileUrl: `https://www.linkedin.com/in/${profile.sub}`,
      isConnected: true,
      
    });

    // Redirect back to app
    res.redirect(`${storedState.redirectUrl}?linkedin_connected=true`);
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    res.redirect(`/?linkedin_error=${encodeURIComponent("auth_failed")}`);
  }
});

/**
 * Post to LinkedIn (alias for /post)
 */
router.post("/publish", async (req, res) => {
  try {
    const userId = 1; // For now, hardcoded
    const { content, hashtags, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Get user's LinkedIn settings
    const settings = await getLinkedinSettings(userId);
    
    if (!settings?.accessToken || !settings?.linkedinUserId) {
      return res.status(401).json({ error: "LinkedIn not connected. Please connect your LinkedIn account first." });
    }

    // Check if token is expired
    if (settings.tokenExpiresAt && new Date(settings.tokenExpiresAt) < new Date()) {
      return res.status(401).json({ error: "LinkedIn token expired, please reconnect" });
    }

    // Format content with hashtags if provided
    let fullContent = content;
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map((tag: string) => `#${tag}`).join(" ");
      fullContent = `${content}\n\n${hashtagString}`;
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(
      settings.accessToken,
      settings.linkedinUserId,
      fullContent,
      imageUrl
    );

    if (result.success) {
      res.json({
        success: true,
        postId: result.postId,
        message: "Post published to LinkedIn successfully",
      });
    } else {
      // Check for duplicate post error
      const isDuplicate = result.error?.includes("DUPLICATE_POST") || result.error?.includes("duplicate");
      res.status(isDuplicate ? 409 : 500).json({
        success: false,
        error: isDuplicate ? "DUPLICATE_POST: Ce post a déjà été publié sur LinkedIn" : result.error,
      });
    }
  } catch (error) {
    console.error("LinkedIn publish error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to post to LinkedIn",
    });
  }
});

/**
 * Post to LinkedIn
 */
router.post("/post", async (req, res) => {
  try {
    const userId = 1; // For now, hardcoded
    const { content, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Get user's LinkedIn settings
    const settings = await getLinkedinSettings(userId);
    
    if (!settings?.accessToken || !settings?.linkedinUserId) {
      return res.status(401).json({ error: "LinkedIn not connected" });
    }

    // Check if token is expired
    if (settings.tokenExpiresAt && new Date(settings.tokenExpiresAt) < new Date()) {
      return res.status(401).json({ error: "LinkedIn token expired, please reconnect" });
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(
      settings.accessToken,
      settings.linkedinUserId,
      content,
      imageUrl
    );

    if (result.success) {
      res.json({
        success: true,
        postId: result.postId,
        message: "Post published to LinkedIn successfully",
      });
    } else {
      // Check for duplicate post error
      const isDuplicate = result.error?.includes("DUPLICATE_POST") || result.error?.includes("duplicate");
      res.status(isDuplicate ? 409 : 500).json({
        success: false,
        error: isDuplicate ? "DUPLICATE_POST: Ce post a déjà été publié sur LinkedIn" : result.error,
      });
    }
  } catch (error) {
    console.error("LinkedIn post error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to post to LinkedIn",
    });
  }
});

/**
 * Disconnect LinkedIn
 */
router.post("/disconnect", async (req, res) => {
  try {
    const userId = 1; // For now, hardcoded

    await upsertLinkedinSettings(userId, {
      linkedinUserId: null,
      accessToken: null,
      tokenExpiresAt: null,
      profileUrl: null,
      isConnected: false,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("LinkedIn disconnect error:", error);
    res.status(500).json({
      error: "Failed to disconnect LinkedIn",
    });
  }
});

export default router;
