import { getExpressApp } from "./_lib/vercel-api.js";

export const config = {
  maxDuration: 300,
  memory: 1024,
};

function restoreRequestUrl(req) {
  const host = req.headers?.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const pathParam = url.searchParams.get("path");

  if (!pathParam) return;

  url.searchParams.delete("path");
  const query = url.searchParams.toString();
  req.url = `/api/${pathParam}${query ? `?${query}` : ""}`;
}

export default async function handler(req, res) {
  restoreRequestUrl(req);
  const app = await getExpressApp();
  return app(req, res);
}
