import {
  isAuthorizedCronRequest,
  runAutoPublishCron,
} from "../_lib/vercel-cron.js";

export const config = {
  maxDuration: 300,
  memory: 1024,
};

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const authorization =
    typeof req.headers?.get === "function"
      ? req.headers.get("authorization")
      : req.headers?.authorization;

  if (!isAuthorizedCronRequest(authorization ?? undefined)) {
    return res.status(401).end("Unauthorized");
  }

  try {
    const { prefill } = await runAutoPublishCron();
    return res.status(200).json({ ok: true, job: "auto-publish", prefill });
  } catch (error) {
    console.error("[Cron] auto-publish failed:", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
