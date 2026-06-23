import { ENV } from "./env";
import { saveImageBuffer } from "../services/localImageStorage";

export type ImageSize = "1024x1024" | "1536x1024" | "1024x1536";

export type GenerateImageOptions = {
  prompt: string;
  size?: string;
};

export type GenerateImageResponse = {
  url: string;
  buffer: Buffer;
};

const FALLBACK_OPENAI_MODEL = "dall-e-3";
const MAX_ATTEMPTS = 3;

const WOW_SUFFIX =
  " Ultra-premium editorial illustration, cinematic depth and lighting, bold harmonious colors, magazine-quality composition, visually striking hero image optimized for LinkedIn feed scroll-stopping impact.";

export async function generateImageBuffer(
  options: GenerateImageOptions
): Promise<Buffer> {
  const size = normalizeImageSize(options.size);
  const prompt = options.prompt.trim();

  if (ENV.imageProvider === "gemini") {
    try {
      return await generateWithGemini(prompt, size);
    } catch (geminiError) {
      const message =
        geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.warn(`[imageGeneration] Gemini failed: ${message}`);

      if (getOpenAiKey()) {
        console.warn("[imageGeneration] Falling back to OpenAI image generation");
        return await generateWithOpenAi(prompt, size);
      }

      throw geminiError;
    }
  }

  return await generateWithOpenAi(prompt, size);
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const buffer = await generateImageBuffer(options);
  const url = await saveImageBuffer(buffer, `post-${Date.now()}.png`);
  return { url, buffer };
}

export function normalizeImageSize(size?: string): ImageSize {
  if (size === "1792x1024" || size === "1536x1024") return "1536x1024";
  if (size === "1024x1792" || size === "1024x1536") return "1024x1536";
  if (size === "1024x1024") return "1024x1024";
  return "1536x1024";
}

function toAspectRatio(size: ImageSize): string {
  if (size === "1024x1024") return "1:1";
  if (size === "1024x1536") return "2:3";
  return "3:2";
}

function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key) {
    throw new Error("GEMINI_API_KEY requise pour la génération d'images Nano Banana");
  }
  return key;
}

function getOpenAiKey(): string {
  return (
    process.env.OPENAI_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? ""
  );
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function isTimeoutError(message: string): boolean {
  return /timeout|upstream connect|disconnect\/reset/i.test(message);
}

function formatImageError(status: number, errorText: string): string {
  if (isTimeoutError(errorText)) {
    return `La génération d'image a expiré (${status}). Réessayez dans quelques instants.`;
  }

  try {
    const parsed = JSON.parse(errorText) as {
      error?: { message?: string; code?: string };
    };
    if (parsed.error?.message) return parsed.error.message;
  } catch {
    // ignore
  }
  return `Erreur génération image (${status}): ${errorText}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractGeminiImageBuffer(result: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { data?: string; mimeType?: string };
        inline_data?: { data?: string; mime_type?: string };
      }>;
    };
  }>;
}): Buffer {
  for (const candidate of result.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) {
        return Buffer.from(inline.data, "base64");
      }
    }
  }
  throw new Error("Aucune image retournée par Gemini Nano Banana");
}

function isBillingOrQuotaError(message: string): boolean {
  return /RESOURCE_EXHAUSTED|credits are depleted|quota|billing/i.test(message);
}

async function generateWithGemini(
  prompt: string,
  size: ImageSize
): Promise<Buffer> {
  const apiKey = getGeminiKey();
  const model = ENV.geminiImageModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const enhancedPrompt = `${prompt.slice(0, 3800)}${WOW_SUFFIX}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: enhancedPrompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: toAspectRatio(size),
      },
    },
  };

  let lastError = "Erreur génération Gemini inconnue";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return extractGeminiImageBuffer(await response.json());
    }

    const errorText = await response.text();
    lastError = formatImageError(response.status, errorText);

    if (isBillingOrQuotaError(errorText)) {
      throw new Error(lastError);
    }

    if (attempt < MAX_ATTEMPTS && isRetryableStatus(response.status)) {
      await sleep(2000 * attempt);
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

function getImageApiUrl(): string {
  const base = ENV.forgeApiUrl.replace(/\/$/, "");
  return `${base}/v1/images/generations`;
}

function toApiSize(model: string, size: ImageSize): string {
  if (size === "1024x1024") return "1024x1024";
  const isLegacyDalle = model.startsWith("dall-e");
  if (size === "1536x1024") return isLegacyDalle ? "1792x1024" : "1536x1024";
  return isLegacyDalle ? "1024x1792" : "1024x1536";
}

function buildOpenAiRequestBody(
  model: string,
  prompt: string,
  size: ImageSize
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    prompt: prompt.slice(0, 4000),
    n: 1,
    size: toApiSize(model, size),
  };

  if (model === "dall-e-3" || model === "dall-e-2") {
    body.response_format = "b64_json";
  }

  if (model === "dall-e-3") {
    body.quality = "standard";
  }

  return body;
}

async function extractOpenAiImageBuffer(
  result: { data?: Array<{ url?: string; b64_json?: string }> }
): Promise<Buffer> {
  const item = result.data?.[0];
  if (!item) {
    throw new Error("Aucune image retournée par l'API");
  }

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }

  if (item.url) {
    const imgResponse = await fetch(item.url);
    if (!imgResponse.ok) {
      throw new Error("Impossible de télécharger l'image générée");
    }
    return Buffer.from(await imgResponse.arrayBuffer());
  }

  throw new Error("Format de réponse image non supporté");
}

async function generateWithOpenAiModel(
  apiKey: string,
  model: string,
  prompt: string,
  size: ImageSize
): Promise<Buffer> {
  const body = buildOpenAiRequestBody(model, prompt, size);
  let lastError = "Erreur génération image inconnue";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(getImageApiUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return extractOpenAiImageBuffer(
        (await response.json()) as {
          data?: Array<{ url?: string; b64_json?: string }>;
        }
      );
    }

    const errorText = await response.text();
    lastError = formatImageError(response.status, errorText);

    if (attempt < MAX_ATTEMPTS && isRetryableStatus(response.status)) {
      await sleep(2000 * attempt);
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

async function generateWithOpenAi(
  prompt: string,
  size: ImageSize
): Promise<Buffer> {
  const apiKey = getOpenAiKey();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY requise pour la génération d'images (fallback OpenAI)"
    );
  }

  const primaryModel = ENV.openaiImageModel;

  try {
    return await generateWithOpenAiModel(apiKey, primaryModel, prompt, size);
  } catch (primaryError) {
    const message =
      primaryError instanceof Error ? primaryError.message : String(primaryError);

    if (
      primaryModel !== FALLBACK_OPENAI_MODEL &&
      (isTimeoutError(message) || /\((503|504|502)\)/.test(message))
    ) {
      console.warn(
        `[imageGeneration] ${primaryModel} failed, fallback to ${FALLBACK_OPENAI_MODEL}`
      );
      return await generateWithOpenAiModel(
        apiKey,
        FALLBACK_OPENAI_MODEL,
        prompt,
        size
      );
    }

    throw primaryError;
  }
}
