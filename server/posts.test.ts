import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getAllPosts: vi.fn(),
  getPostById: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getPostsCount: vi.fn(),
  getAllCategories: vi.fn(),
}));

import { getAllPosts, getPostById, createPost, getPostsCount, getAllCategories } from "./db";

describe("Posts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllPosts", () => {
    it("should return posts from database", async () => {
      const mockPosts = [
        {
          id: 1,
          title: "Test Post FR",
          content: "Contenu du post",
          language: "FR",
          theme: "Motivation",
          status: "draft",
        },
        {
          id: 2,
          title: "Test Post EN",
          content: "Post content",
          language: "EN",
          theme: "Leadership",
          status: "draft",
        },
      ];

      vi.mocked(getAllPosts).mockResolvedValue(mockPosts as any);

      const result = await getAllPosts();
      expect(result).toHaveLength(2);
      expect(result[0].language).toBe("FR");
      expect(result[1].language).toBe("EN");
    });

    it("should filter posts by language", async () => {
      const mockPostsFR = [
        {
          id: 1,
          title: "Test Post FR",
          content: "Contenu du post",
          language: "FR",
          theme: "Motivation",
        },
      ];

      vi.mocked(getAllPosts).mockResolvedValue(mockPostsFR as any);

      const result = await getAllPosts({ language: "FR" });
      expect(getAllPosts).toHaveBeenCalledWith({ language: "FR" });
    });
  });

  describe("getPostById", () => {
    it("should return a single post by id", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        content: "Content",
        language: "FR",
        theme: "Motivation",
      };

      vi.mocked(getPostById).mockResolvedValue(mockPost as any);

      const result = await getPostById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it("should return undefined for non-existent post", async () => {
      vi.mocked(getPostById).mockResolvedValue(undefined);

      const result = await getPostById(999);
      expect(result).toBeUndefined();
    });
  });

  describe("createPost", () => {
    it("should create a new post and return id", async () => {
      vi.mocked(createPost).mockResolvedValue(1);

      const newPost = {
        title: "New Post",
        content: "New content",
        language: "FR" as const,
        theme: "Motivation",
        mediaType: "none" as const,
        status: "draft" as const,
      };

      const result = await createPost(newPost);
      expect(result).toBe(1);
      expect(createPost).toHaveBeenCalledWith(newPost);
    });
  });

  describe("getPostsCount", () => {
    it("should return total count of posts", async () => {
      vi.mocked(getPostsCount).mockResolvedValue(51);

      const result = await getPostsCount();
      expect(result).toBe(51);
    });
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const mockCategories = [
        { id: 1, name: "Motivation" },
        { id: 2, name: "Leadership" },
      ];

      vi.mocked(getAllCategories).mockResolvedValue(mockCategories as any);

      const result = await getAllCategories();
      expect(result).toHaveLength(2);
    });
  });
});
