export const ENV = {
  appId: process.env.APP_ID ?? "linkedrank",
  appUrl: process.env.APP_URL ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  llmProvider: process.env.GEMINI_API_KEY
    ? "gemini"
    : process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY
      ? "openai"
      : "none",
  forgeApiUrl:
    process.env.LLM_API_URL ??
    (process.env.GEMINI_API_KEY
      ? "https://generativelanguage.googleapis.com/v1beta/openai"
      : process.env.OPENAI_API_URL ??
        process.env.BUILT_IN_FORGE_API_URL ??
        "https://api.openai.com"),
  forgeApiKey:
    process.env.GEMINI_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.BUILT_IN_FORGE_API_KEY ??
    "",
  llmModel:
    process.env.GEMINI_MODEL ??
    process.env.OPENAI_MODEL ??
    (process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "gpt-4o"),
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  geminiImageModel:
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image",
  imageProvider:
    process.env.IMAGE_PROVIDER ??
    (process.env.GEMINI_API_KEY ? "gemini" : "openai"),
  /** @deprecated use llmModel */
  openaiModel:
    process.env.GEMINI_MODEL ??
    process.env.OPENAI_MODEL ??
    (process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "gpt-4o"),
  supabaseUrl:
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
