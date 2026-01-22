import { eq, desc, asc, and, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, linkedinPosts, InsertLinkedinPost, LinkedinPost, postCategories, postImages, InsertPostImage, linkedinSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== LINKEDIN POSTS FUNCTIONS ====================

export async function getAllPosts(options?: {
  language?: "FR" | "EN";
  status?: "draft" | "scheduled" | "published" | "failed";
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get posts: database not available");
    return [];
  }

  const conditions = [];
  
  if (options?.language) {
    conditions.push(eq(linkedinPosts.language, options.language));
  }
  if (options?.status) {
    conditions.push(eq(linkedinPosts.status, options.status));
  }
  if (options?.search) {
    conditions.push(like(linkedinPosts.content, `%${options.search}%`));
  }

  let query = db.select().from(linkedinPosts);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  query = query.orderBy(asc(linkedinPosts.sortOrder), desc(linkedinPosts.createdAt)) as typeof query;
  
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return await query;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(linkedinPosts).where(eq(linkedinPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPost(post: InsertLinkedinPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(linkedinPosts).values(post);
  return result[0].insertId;
}

export async function updatePost(id: number, post: Partial<InsertLinkedinPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(linkedinPosts).set(post).where(eq(linkedinPosts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(linkedinPosts).where(eq(linkedinPosts.id, id));
}

export async function getPostsCount(options?: { language?: "FR" | "EN"; status?: string }) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(linkedinPosts);
  return result[0]?.count || 0;
}

export async function bulkCreatePosts(posts: InsertLinkedinPost[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (posts.length === 0) return;
  
  await db.insert(linkedinPosts).values(posts);
}

// ==================== POST IMAGES FUNCTIONS ====================

export async function getPostImages(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(postImages).where(eq(postImages.postId, postId));
}

export async function createPostImage(image: InsertPostImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(postImages).values(image);
  return result[0].insertId;
}

export async function deletePostImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(postImages).where(eq(postImages.id, id));
}

// ==================== CATEGORIES FUNCTIONS ====================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(postCategories).orderBy(asc(postCategories.sortOrder));
}

export async function createCategory(category: { name: string; nameEn?: string; description?: string; color?: string; icon?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(postCategories).values(category);
  return result[0].insertId;
}

// ==================== LINKEDIN SETTINGS FUNCTIONS ====================

export async function getLinkedinSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(linkedinSettings).where(eq(linkedinSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertLinkedinSettings(userId: number, settings: Partial<typeof linkedinSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getLinkedinSettings(userId);
  
  if (existing) {
    await db.update(linkedinSettings).set(settings).where(eq(linkedinSettings.userId, userId));
  } else {
    await db.insert(linkedinSettings).values({ userId, ...settings });
  }
}
