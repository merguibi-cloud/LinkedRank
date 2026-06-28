import express, { type Express } from "express";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import authRouter from "../routes/auth";
import linkedinRouter from "../routes/linkedin";
import autoPublishRouter from "../routes/autoPublish";
import cronRouter from "../routes/cron";
import scheduleRouter from "../routes/schedule";
import mediaRouter from "../routes/media";
import stripeRouter from "../routes/stripe";
import stripeWebhookRouter from "../routes/stripeWebhook";
import { supabaseSessionMiddleware } from "./supabaseMiddleware";

// Filet de sécurité global : sans ça, une rejection non gérée n'importe où
// (ex. un blip de connexion DB transitoire) fait crasher tout le process Node,
// coupant toutes les requêtes en cours sur cette instance — pas seulement celle
// qui a échoué. On loggue pour la visibilité (monitoring) plutôt que de laisser
// crasher silencieusement.
let processGuardsRegistered = false;
function registerProcessGuards(): void {
  if (processGuardsRegistered) return;
  processGuardsRegistered = true;

  process.on("unhandledRejection", (reason) => {
    console.error("[Process] Unhandled promise rejection:", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("[Process] Uncaught exception:", error);
  });
}

/** Routes HTTP /api sans Vite ni fichiers statiques (Vercel serverless). */
export function registerHttpApi(app: Express): void {
  registerProcessGuards();

  app.use(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookRouter
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app.use(supabaseSessionMiddleware);
  registerOAuthRoutes(app);
  app.use("/api/auth", authRouter);
  app.use("/api/linkedin", linkedinRouter);
  app.use("/api/auto-publish", autoPublishRouter);
  app.use("/api/cron", cronRouter);
  app.use("/api/schedule", scheduleRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/stripe", stripeRouter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Filet de sécurité Express : si une route synchrone lance une erreur non
  // interceptée par son propre try/catch, on répond en 500 au lieu de laisser
  // Express planter le process (doit être enregistré en dernier).
  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("[Express] Unhandled route error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
}

export async function createApiApp(): Promise<Express> {
  const app = express();
  registerHttpApi(app);
  return app;
}
