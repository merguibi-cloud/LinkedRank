import { Router, type Request, type Response } from "express";
import { isAuthorizedCronRequest } from "../lib/cronAuth";
import {
  runAutoPublishPrefill,
  runAutoPublishTick,
} from "../workers/autoPublishWorker";

const router = Router();

function requireCronAuth(req: Request, res: Response): boolean {
  if (!isAuthorizedCronRequest(req.headers.authorization)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/auto-publish", async (req, res) => {
  if (!requireCronAuth(req, res)) return;

  try {
    await runAutoPublishTick();
    res.json({ ok: true, job: "auto-publish-tick" });
  } catch (error) {
    console.error("[Cron] auto-publish tick failed:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/auto-publish-prefill", async (req, res) => {
  if (!requireCronAuth(req, res)) return;

  try {
    await runAutoPublishPrefill();
    res.json({ ok: true, job: "auto-publish-prefill" });
  } catch (error) {
    console.error("[Cron] auto-publish prefill failed:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
