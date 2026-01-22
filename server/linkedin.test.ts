import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.stubEnv("LINKEDIN_CLIENT_ID", "test-client-id");
vi.stubEnv("LINKEDIN_CLIENT_SECRET", "test-client-secret");

import {
  getLinkedInAuthUrl,
  exchangeCodeForTokens,
  getLinkedInProfile,
  postToLinkedIn,
  isLinkedInConfigured,
} from "./services/linkedin";

describe("LinkedIn Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isLinkedInConfigured", () => {
    it("should return true when credentials are set", () => {
      expect(isLinkedInConfigured()).toBe(true);
    });
  });

  describe("getLinkedInAuthUrl", () => {
    it("should generate a valid OAuth URL", () => {
      const redirectUri = "https://example.com/callback";
      const state = "test-state-123";

      const url = getLinkedInAuthUrl(redirectUri, state);

      expect(url).toContain("https://www.linkedin.com/oauth/v2/authorization");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("redirect_uri=" + encodeURIComponent(redirectUri));
      expect(url).toContain("state=" + state);
      expect(url).toContain("scope=");
    });
  });

  describe("exchangeCodeForTokens", () => {
    it("should exchange code for tokens successfully", async () => {
      const mockTokenResponse = {
        access_token: "test-access-token",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await exchangeCodeForTokens("auth-code", "https://example.com/callback");

      expect(result.accessToken).toBe("test-access-token");
      expect(result.expiresIn).toBe(3600);
      expect(result.refreshToken).toBe("test-refresh-token");
    });

    it("should throw error on failed token exchange", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("Invalid code"),
      });

      await expect(
        exchangeCodeForTokens("invalid-code", "https://example.com/callback")
      ).rejects.toThrow("LinkedIn token exchange failed");
    });
  });

  describe("getLinkedInProfile", () => {
    it("should fetch user profile successfully", async () => {
      const mockProfile = {
        sub: "user-123",
        name: "Test User",
        given_name: "Test",
        family_name: "User",
        picture: "https://example.com/photo.jpg",
        email: "test@example.com",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });

      const result = await getLinkedInProfile("test-access-token");

      expect(result.sub).toBe("user-123");
      expect(result.name).toBe("Test User");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.linkedin.com/v2/userinfo",
        expect.objectContaining({
          headers: { Authorization: "Bearer test-access-token" },
        })
      );
    });

    it("should throw error on failed profile fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(getLinkedInProfile("invalid-token")).rejects.toThrow(
        "Failed to get LinkedIn profile"
      );
    });
  });

  describe("postToLinkedIn", () => {
    it("should post content successfully", async () => {
      const mockPostResponse = {
        id: "urn:li:share:123456",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPostResponse),
      });

      const result = await postToLinkedIn(
        "test-access-token",
        "user-123",
        "Test post content"
      );

      expect(result.success).toBe(true);
      expect(result.postId).toBe("urn:li:share:123456");
    });

    it("should handle post failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("Rate limit exceeded"),
      });

      const result = await postToLinkedIn(
        "test-access-token",
        "user-123",
        "Test post content"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to post");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await postToLinkedIn(
        "test-access-token",
        "user-123",
        "Test post content"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });
});
