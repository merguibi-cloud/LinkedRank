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
import stripeRouter from "../routes/stripe";
import stripeWebhookRouter from "../routes/stripeWebhook";
import { supabaseSessionMiddleware } from "./supabaseMiddleware";

/** Routes HTTP /api sans Vite ni fichiers statiques (Vercel serverless). */
export function registerHttpApi(app: Express): void {
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
  app.use("/api/stripe", stripeRouter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
}

export async function createApiApp(): Promise<Express> {
  const app = express();
  registerHttpApi(app);
  return app;
}
