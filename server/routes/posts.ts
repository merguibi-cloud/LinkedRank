import { Router, Request, Response } from "express";
import { getAllPosts, getPostById, createPost, updatePost, deletePost, bulkCreatePosts, getPostsCount } from "../db";
import { InsertLinkedinPost } from "../../drizzle/schema";

const router = Router();

// GET /api/posts - Get all posts with optional filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { language, status, limit, offset, search } = req.query;
    
    const posts = await getAllPosts({
      language: language as "FR" | "EN" | undefined,
      status: status as "draft" | "scheduled" | "published" | "failed" | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      search: search as string | undefined,
    });

    const count = await getPostsCount({ language: language as "FR" | "EN" | undefined });

    res.json({ posts, total: count });
  } catch (error) {
    console.error("[Posts API] Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/posts/:id - Get a single post
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const post = await getPostById(id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("[Posts API] Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/posts - Create a new post
router.post("/", async (req: Request, res: Response) => {
  try {
    const postData: InsertLinkedinPost = req.body;
    
    if (!postData.title || !postData.content || !postData.language || !postData.theme) {
      return res.status(400).json({ error: "Missing required fields: title, content, language, theme" });
    }
    
    const id = await createPost(postData);
    res.status(201).json({ id, message: "Post created successfully" });
  } catch (error) {
    console.error("[Posts API] Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// POST /api/posts/bulk - Create multiple posts at once
router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const { posts } = req.body;
    
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ error: "Posts array is required" });
    }
    
    await bulkCreatePosts(posts);
    res.status(201).json({ message: `${posts.length} posts created successfully` });
  } catch (error) {
    console.error("[Posts API] Error bulk creating posts:", error);
    res.status(500).json({ error: "Failed to create posts" });
  }
});

// PUT /api/posts/:id - Update a post
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const postData: Partial<InsertLinkedinPost> = req.body;
    
    await updatePost(id, postData);
    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("[Posts API] Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await deletePost(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[Posts API] Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
