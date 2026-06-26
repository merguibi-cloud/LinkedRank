/** Détecte un runtime serverless (Vercel, Lambda) où le disque est en lecture seule. */
export function isServerlessDeployment(): boolean {
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return true;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  if (process.cwd().startsWith("/var/task")) return true;
  return false;
}
