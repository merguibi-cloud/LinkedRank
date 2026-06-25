import express, { type Express } from "express";
import { type Server } from "http";
import { startAutoPublishWorker } from "../workers/autoPublishWorker";
import { startAgentScheduler } from "../services/agentScheduler";
import { getLinkedInRedirectUri } from "./linkedinRedirect";
import { isLinkedInConfigured } from "../services/linkedin";
import { isSupabaseConfigured } from "./supabase";
import { registerHttpApi } from "./httpApi";

let workersStarted = false;

export function startBackgroundWorkers() {
  if (workersStarted) return;
  workersStarted = true;

  if (process.env.VERCEL) {
    console.log(
      "[AutoPublish] Vercel détecté — worker local désactivé, jobs via /api/cron/*"
    );
    return;
  }

  startAutoPublishWorker();
  startAgentScheduler();
}

export async function configureApp(app: Express, httpServer?: Server) {
  registerHttpApi(app);

  if (process.env.NODE_ENV === "development" && httpServer) {
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }
}

export async function createApp(): Promise<Express> {
  const app = express();
  await configureApp(app);
  return app;
}

export { createApiApp } from "./httpApi";

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
