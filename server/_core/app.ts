import express, { type Express } from "express";
import { type Server } from "http";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import authRouter from "../routes/auth";
import linkedinRouter from "../routes/linkedin";
import autoPublishRouter from "../routes/autoPublish";
import scheduleRouter from "../routes/schedule";
import stripeRouter from "../routes/stripe";
import stripeWebhookRouter from "../routes/stripeWebhook";
import { startAutoPublishWorker } from "../workers/autoPublishWorker";
import { startAgentScheduler } from "../services/agentScheduler";
import { getLinkedInRedirectUri } from "./linkedinRedirect";
import { isLinkedInConfigured } from "../services/linkedin";
import { supabaseSessionMiddleware } from "./supabaseMiddleware";
import { isSupabaseConfigured } from "./supabase";

let workersStarted = false;

export function startBackgroundWorkers() {
  if (workersStarted || process.env.VERCEL) return;
  workersStarted = true;
  startAutoPublishWorker();
  startAgentScheduler();
}

export async function configureApp(app: Express, httpServer?: Server) {
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookRouter);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use(supabaseSessionMiddleware);
  registerOAuthRoutes(app);
  app.use("/api/auth", authRouter);
  app.use("/api/linkedin", linkedinRouter);
  app.use("/api/auto-publish", autoPublishRouter);
  app.use("/api/schedule", scheduleRouter);
  app.use("/api/stripe", stripeRouter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development" && httpServer) {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
}

export async function createApp(): Promise<Express> {
  const app = express();
  await configureApp(app);
  return app;
}

export function logStartupInfo(port: number) {
  console.log(`Server running on http://localhost:${port}/`);

  if (isSupabaseConfigured()) {
    console.log("[Supabase] Auth configuré");
  } else {
    console.warn("[Supabase] SUPABASE_URL / SUPABASE_ANON_KEY non configurés");
  }

  if (isLinkedInConfigured()) {
    console.log(`[LinkedIn] Redirect URI à enregistrer : ${getLinkedInRedirectUri()}`);
  } else {
    console.warn("[LinkedIn] LINKEDIN_CLIENT_ID/SECRET non configurés");
  }
}
