/**
 * LinkedIn Auto Publisher Service
 * Handles automatic publishing of agent-generated content to LinkedIn
 */

import { getLinkedinSettings } from "../db";
import { postToLinkedIn } from "./linkedin";
import { notifyPostPublished } from "./notificationService";

export interface GeneratedPostContent {
  title?: string;
  content: string;
  hashtags?: string[];
  suggestedMedia?: string;
  callToAction?: string;
  imageUrl?: string;
}

export interface PublishResult {
  success: boolean;
  linkedinPostId?: string;
  error?: string;
}

/**
 * Publish generated content to LinkedIn
 */
export async function publishToLinkedIn(
  userId: number,
  post: GeneratedPostContent
): Promise<PublishResult> {
  try {
    console.log("[LinkedInAutoPublisher] Starting publish for user:", userId);
    
    // Get user's LinkedIn settings
    const settings = await getLinkedinSettings(userId);
    
    if (!settings?.accessToken || !settings?.linkedinUserId) {
      return {
        success: false,
        error: "LinkedIn not connected. Please connect your LinkedIn account first.",
      };
    }

    // Check if token is expired
    if (settings.tokenExpiresAt && new Date(settings.tokenExpiresAt) < new Date()) {
      return {
        success: false,
        error: "LinkedIn token expired, please reconnect your account.",
      };
    }

    // Format content with hashtags if provided
    let fullContent = post.content;
    
    // Add call to action if present
    if (post.callToAction) {
      fullContent += `\n\n${post.callToAction}`;
    }
    
    // Add hashtags if present
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags
        .map((tag: string) => tag.startsWith("#") ? tag : `#${tag}`)
        .join(" ");
      fullContent += `\n\n${hashtagString}`;
    }

    console.log("[LinkedInAutoPublisher] Posting to LinkedIn...");
    console.log("[LinkedInAutoPublisher] Content length:", fullContent.length);
    console.log("[LinkedInAutoPublisher] Has image:", !!post.imageUrl);

    // Post to LinkedIn
    const result = await postToLinkedIn(
      settings.accessToken,
      settings.linkedinUserId,
      fullContent,
      post.imageUrl || post.suggestedMedia
    );

    if (result.success) {
      console.log("[LinkedInAutoPublisher] Successfully published, postId:", result.postId);
      const preview = post.title || fullContent.slice(0, 80).replace(/\n/g, " ");
      await notifyPostPublished(userId, preview);
      return {
        success: true,
        linkedinPostId: result.postId,
      };
    } else {
      console.error("[LinkedInAutoPublisher] Publish failed:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("[LinkedInAutoPublisher] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during LinkedIn publish",
    };
  }
}

/**
 * Check if user can publish to LinkedIn
 */
export async function canPublishToLinkedIn(userId: number): Promise<{ canPublish: boolean; reason?: string }> {
  try {
    const settings = await getLinkedinSettings(userId);
    
    if (!settings?.accessToken || !settings?.linkedinUserId) {
      return {
        canPublish: false,
        reason: "LinkedIn not connected",
      };
    }

    if (settings.tokenExpiresAt && new Date(settings.tokenExpiresAt) < new Date()) {
      return {
        canPublish: false,
        reason: "LinkedIn token expired",
      };
    }

    return { canPublish: true };
  } catch (error) {
    return {
      canPublish: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Publish multiple posts with delay between each
 */
export async function publishMultiplePosts(
  userId: number,
  posts: GeneratedPostContent[],
  delayBetweenPosts: number = 60000 // 1 minute default
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  
  for (let i = 0; i < posts.length; i++) {
    const result = await publishToLinkedIn(userId, posts[i]);
    results.push(result);
    
    // Wait between posts (except for the last one)
    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenPosts));
    }
  }
  
  return results;
}
