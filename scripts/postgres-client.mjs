import postgres from "postgres";

export const POSTGRES_SCRIPT_OPTIONS = {
  prepare: false,
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
};

export function createScriptClient(url) {
  const connectionString =
    url ?? process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }
  return postgres(connectionString, POSTGRES_SCRIPT_OPTIONS);
}
