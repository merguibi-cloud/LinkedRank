import { describe, expect, it } from "vitest";
import {
  resolvePublicUrl,
  resolvePublicUrlForKey,
  resolveStorageAssetUrl,
} from "./_core/publicUrl";

describe("resolvePublicUrl", () => {
  it("rewrites localhost URLs to public base", () => {
    const resolved = resolvePublicUrl(
      "http://localhost:3000/uploads/media-library/1/test.png"
    );
    expect(resolved).toContain("/uploads/media-library/1/test.png");
  });

  it("rewrites relative upload paths", () => {
    const resolved = resolvePublicUrl("/uploads/generated/foo.png");
    expect(resolved).toContain("/uploads/generated/foo.png");
    expect(resolved.startsWith("http")).toBe(true);
  });

  it("uses media proxy for localhost URLs via fileKey", () => {
    const url = resolveStorageAssetUrl(
      "http://localhost:3000/uploads/media-library/1/x.png",
      "media-library/1/x.png"
    );
    expect(url).toContain("/api/media/media-library/1/x.png");
  });

  it("extracts file key from localhost URL when imageKey missing", () => {
    const url = resolveStorageAssetUrl(
      "http://localhost:3000/uploads/media-library/99/photo.png",
      null
    );
    expect(url).toContain("/api/media/media-library/99/photo.png");
  });

  it("keeps absolute cloud URLs unchanged", () => {
    const blob =
      "https://abc.public.blob.vercel-storage.com/media-library/1/x.png";
    expect(resolvePublicUrl(blob)).toBe(blob);
  });
});

describe("resolvePublicUrlForKey", () => {
  it("builds local upload path in dev", () => {
    expect(resolvePublicUrlForKey("generated/test.png")).toContain(
      "/uploads/generated/test.png"
    );
  });
});
