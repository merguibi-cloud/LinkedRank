import {
  extractCronAuthFromRequest,
  isAuthorizedCronRequest,
  runAutoPublishCron,
} from "../_lib/vercel-cron.js";

export const config = {
  maxDuration: 300,
  memory: 1024,
};

function getQuery(req) {
  if (req.query && typeof req.query === "object") return req.query;
  try {
    const host = req.headers?.host ?? "localhost";
    const url = new URL(req.url ?? "/", `http://${host}`);
    return Object.fromEntries(url.searchParams.entries());
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const headers =
    typeof req.headers?.get === "function"
      ? Object.fromEntries(req.headers.entries())
      : req.headers;

  if (
    !isAuthorizedCronRequest(
      extractCronAuthFromRequest({ headers, query: getQuery(req) })
    )
  ) {
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
