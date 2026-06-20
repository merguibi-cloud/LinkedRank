import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { Router } from "express";
import { getUserByEmail, getUserByOpenId, upsertUser } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { hashPassword, verifyPassword } from "../services/password";

const router = Router();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailOpenId(email: string) {
  return `email:${normalizeEmail(email)}`;
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    }

    const openId = emailOpenId(normalizedEmail);
    const passwordHash = await hashPassword(password);

    await upsertUser({
      openId,
      email: normalizedEmail,
      name: name?.trim() || null,
      loginMethod: "email",
      passwordHash,
      lastSignedIn: new Date(),
    });

    const user = await getUserByOpenId(openId);
    if (!user) {
      return res.status(500).json({ error: "Échec de création du compte" });
    }

    const sessionToken = await sdk.createSessionToken(openId, {
      name: user.name || normalizedEmail,
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: normalizedEmail,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ error: "Inscription échouée" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await getUserByEmail(normalizedEmail);

    if (!user?.passwordHash) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const sessionToken = await sdk.createSessionToken(user.openId, {
      name: user.name || normalizedEmail,
      expiresInMs: ONE_YEAR_MS,
    });

    await upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Connexion échouée" });
  }
});

export default router;
