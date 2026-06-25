import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("api/_lib", { recursive: true });
copyFileSync("dist/vercelApi.js", "api/_lib/vercel-api.js");
copyFileSync("dist/vercelCron.js", "api/_lib/vercel-cron.js");
