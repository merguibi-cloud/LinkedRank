import { Router, type Request, type Response } from "express";
import { nanoid } from "nanoid";
import {
  getUserById,
  upsertUser,
  upsertLinkedinSettings,
  getLinkedinSettings,
} from "../db";
import {
  type AuthenticatedRequest,
  requireAuth,
} from "../_core/authMiddleware";
import { getLinkedInRedirectUri } from "../_core/linkedinRedirect";
import { resolveStorageAssetUrl } from "../_core/publicUrl";
import { checkRateLimit } from "../_core/rateLimit";
import { resolveAppUser } from "../_core/supabase";
import {
  getLinkedInAuthUrl,
  exchangeCodeForTokens,
  getLinkedInProfile,
  postToLinkedIn,
  isLinkedInConfigured,
} from "../services/linkedin";
import {
  buildLinkedInSettingsPayload,
  formatLinkedInStatus,
} from "../services/linkedinAuth";
import {
  notifyPostPublished,
  notifySystem,
} from "../services/notificationService";

const router = Router();

type OAuthState = {
  userId?: number;
  redirectUrl: string;
};

const oauthStates = new Map<string, OAuthState>();

function sanitizeRedirect(redirect: unknown, fallback = "/dashboard") {
  if (typeof redirect !== "string") return fallback;

  try {
    const decoded = decodeURIComponent(redirect).trim();
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (
      decoded.includes("\\") ||
      decoded.includes("\n") ||
      decoded.includes("\r")
    ) {
      return fallback;
    }

    return decoded;
  } catch {
    return fallback;
  }
}

async function resolveOptionalUserId(
  req: Request,
  res: Response
): Promise<number | undefined> {
  const user = await resolveAppUser(req, res);
  return user?.id;
}

/**
 * Public setup info — shows which redirect URI to register in LinkedIn Developer Portal
 */
router.get("/config", (_req, res) => {
  const redirectUri = getLinkedInRedirectUri();
  res.json({
    configured: isLinkedInConfigured(),
    redirectUri,
    scopes: ["openid", "profile", "w_member_social", "email"],
    endpoints: {
      connect: "GET /api/linkedin/auth?redirect=/dashboard",
      status: "GET /api/linkedin/status",
      publish: "POST /api/linkedin/post",
      schedule: "GET/POST /api/auto-publish/settings",
      publishNow: "POST /api/auto-publish/publish-now",
    },
    linkedinPortal: "https://www.linkedin.com/developers/apps",
  });
});

/**
 * Check if LinkedIn is configured and connected for the current user
 */
router.get("/status", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const settings = await getLinkedinSettings(userId);

    res.json({
      configured: isLinkedInConfigured(),
      ...formatLinkedInStatus(settings),
    });
  } catch (error) {
    console.error("LinkedIn status error:", error);
    res.status(500).json({ error: "Failed to fetch LinkedIn status" });
  }
});

/**
 * Refresh profile info from LinkedIn API
 */
router.post("/sync", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const settings = await getLinkedinSettings(userId);

    if (!settings?.accessToken) {
      return res.status(401).json({ error: "LinkedIn not connected" });
    }

    if (
      settings.tokenExpiresAt &&
      new Date(settings.tokenExpiresAt) < new Date()
    ) {
      return res
        .status(401)
        .json({ error: "LinkedIn token expired, please reconnect" });
    }

    const profile = await getLinkedInProfile(settings.accessToken);

    await upsertLinkedinSettings(userId, {
      linkedinUserId: profile.sub,
      profileName: profile.name,
      profilePicture: profile.picture ?? null,
      email: profile.email ?? null,
      isConnected: true,
    });

    const updated = await getLinkedinSettings(userId);
    res.json({
      success: true,
      ...formatLinkedInStatus(updated),
    });
  } catch (error) {
    console.error("LinkedIn sync error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync LinkedIn profile",
    });
  }
});

/**
 * Connect LinkedIn to an existing account (requires app session)
 */
router.get("/auth", async (req, res) => {
  try {
    const userId = await resolveOptionalUserId(req, res);
    if (!userId) {
      const redirect = sanitizeRedirect(req.query.redirect);
      return res.redirect(
        `/login?redirect=${encodeURIComponent(redirect)}&connectLinkedIn=1`
      );
    }

    const state = nanoid();
    const redirectUri = getLinkedInRedirectUri(req);

    oauthStates.set(state, {
      userId,
      redirectUrl: sanitizeRedirect(req.query.redirect),
    });

    setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);

    const authUrl = getLinkedInAuthUrl(redirectUri, state);

    if (req.query.format === "json") {
      res.json({ authUrl });
    } else {
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    if (req.query.format === "json") {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate LinkedIn auth",
      });
    } else {
      res.redirect(
        `/?linkedin_error=${encodeURIComponent("auth_init_failed")}`
      );
    }
  }
});

/**
 * LinkedIn OAuth callback (public — called by LinkedIn)
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `/?linkedin_error=${encodeURIComponent(error as string)}`
      );
    }

    if (!code || !state) {
      return res.redirect("/?linkedin_error=missing_params");
    }

    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      return res.redirect("/?linkedin_error=invalid_state");
    }

    oauthStates.delete(state as string);

    const redirectUri = getLinkedInRedirectUri(req);

    const tokens = await exchangeCodeForTokens(code as string, redirectUri);
    const profile = await getLinkedInProfile(tokens.accessToken);

    const userId = storedState.userId;

    if (!userId) {
      return res.redirect("/login?linkedin_error=session_required");
    }

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return res.redirect("/?linkedin_error=user_not_found");
    }

    await upsertUser({
      openId: existingUser.openId,
      name: profile.name || existingUser.name,
      email: profile.email ?? existingUser.email,
      lastSignedIn: new Date(),
    });

    await upsertLinkedinSettings(
      userId,
      buildLinkedInSettingsPayload(profile, tokens)
    );

    await notifySystem(
      userId,
      "LinkedIn connecté",
      `Votre compte LinkedIn (${profile.name || "profil"}) est maintenant lié. Vous pouvez publier directement depuis LinkedRank.`,
      "medium"
    );

    res.redirect(`${storedState.redirectUrl}?linkedin_connected=true`);
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    res.redirect(`/?linkedin_error=${encodeURIComponent("auth_failed")}`);
  }
});

async function publishForUser(
  userId: number,
  content: string,
  imageUrl?: string,
  hashtags?: string[],
  generatedPostId?: number,
  pdfUrl?: string,
  documentTitle?: string,
  pdfKey?: string
) {
  const settings = await getLinkedinSettings(userId);

  if (!settings?.accessToken || !settings?.linkedinUserId) {
    return {
      status: 401,
      body: {
        error:
          "LinkedIn not connected. Please connect your LinkedIn account first.",
      },
    };
  }

  if (
    settings.tokenExpiresAt &&
    new Date(settings.tokenExpiresAt) < new Date()
  ) {
    return {
      status: 401,
      body: { error: "LinkedIn token expired, please reconnect" },
    };
  }

  let fullContent = content;
  if (hashtags && hashtags.length > 0) {
    const hashtagString = hashtags.map((tag: string) => `#${tag}`).join(" ");
    fullContent = `${content}\n\n${hashtagString}`;
  }

  const resolvedPdfUrl = pdfUrl
    ? resolveStorageAssetUrl(pdfUrl, pdfKey) ?? pdfUrl
    : undefined;

  const result = await postToLinkedIn(
    settings.accessToken,
    settings.linkedinUserId,
    fullContent,
    resolvedPdfUrl
      ? { pdfUrl: resolvedPdfUrl, documentTitle: documentTitle || content.slice(0, 80) }
      : imageUrl
  );

  if (result.success) {
    const preview = content.slice(0, 80).replace(/\n/g, " ");
    await notifyPostPublished(userId, preview);

    if (generatedPostId) {
      const { markGeneratedPostPublished } = await import(
        "../services/postAssetService"
      );
      await markGeneratedPostPublished(userId, generatedPostId, result.postId!);
    }

    return {
      status: 200,
      body: {
        success: true,
        postId: result.postId,
        message: "Post published to LinkedIn successfully",
      },
    };
  }

  const isDuplicate =
    result.error?.includes("DUPLICATE_POST") ||
    result.error?.includes("duplicate");

  return {
    status: isDuplicate ? 409 : 500,
    body: {
      success: false,
      error: isDuplicate
        ? "DUPLICATE_POST: Ce post a déjà été publié sur LinkedIn"
        : result.error,
    },
  };
}

router.post("/publish", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { content, hashtags, imageUrl, generatedPostId, pdfUrl, pdfKey, documentTitle } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const rateLimit = await checkRateLimit(userId, "linkedin_publish");
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: "Trop de publications en peu de temps. Réessayez dans quelques minutes.",
      });
    }

    const result = await publishForUser(
      userId,
      content,
      imageUrl,
      hashtags,
      generatedPostId ? Number(generatedPostId) : undefined,
      pdfUrl,
      documentTitle,
      pdfKey
    );
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("LinkedIn publish error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to post to LinkedIn",
    });
  }
});

router.post("/post", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { content, imageUrl, generatedPostId } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const rateLimit = await checkRateLimit(userId, "linkedin_publish");
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: "Trop de publications en peu de temps. Réessayez dans quelques minutes.",
      });
    }

    const result = await publishForUser(
      userId,
      content,
      imageUrl,
      undefined,
      generatedPostId ? Number(generatedPostId) : undefined
    );
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("LinkedIn post error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to post to LinkedIn",
    });
  }
});

router.post("/disconnect", requireAuth, async (req, res) => {
  try {
    const { userId } = req as AuthenticatedRequest;

    await upsertLinkedinSettings(userId, {
      linkedinUserId: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      profileName: null,
      profilePicture: null,
      email: null,
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
