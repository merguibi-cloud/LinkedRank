import { ENV } from "./env";
import { saveImageBuffer } from "../services/localImageStorage";

export type ImageSize = "1024x1024" | "1536x1024" | "1024x1536";

export type GenerateImageOptions = {
  prompt: string;
  size?: string;
};

export type GenerateImageResponse = {
  url: string;
};

const FALLBACK_IMAGE_MODEL = "dall-e-3";
const MAX_ATTEMPTS = 3;

export function normalizeImageSize(size?: string): ImageSize {
  if (size === "1792x1024" || size === "1536x1024") return "1536x1024";
  if (size === "1024x1792" || size === "1024x1536") return "1024x1536";
  if (size === "1024x1024") return "1024x1024";
  return "1536x1024";
}

function toApiSize(model: string, size: ImageSize): string {
  if (size === "1024x1024") return "1024x1024";
  const isLegacyDalle = model.startsWith("dall-e");
  if (size === "1536x1024") return isLegacyDalle ? "1792x1024" : "1536x1024";
  return isLegacyDalle ? "1024x1792" : "1024x1536";
}

function getImageApiUrl(): string {
  const base = ENV.forgeApiUrl.replace(/\/$/, "");
  if (base.includes("generativelanguage.googleapis.com")) {
    throw new Error(
      "La génération d'images nécessite OPENAI_API_KEY (Gemini ne supporte pas DALL-E)"
    );
  }
  return `${base}/v1/images/generations`;
}

function getOpenAiKey(): string {
  const key =
    process.env.OPENAI_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "";
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY requise pour la génération d'images (DALL-E)"
    );
  }
  return key;
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

function buildRequestBody(
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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractImageBuffer(
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

async function generateWithModel(
  apiKey: string,
  model: string,
  prompt: string,
  size: ImageSize
): Promise<Buffer> {
  const body = buildRequestBody(model, prompt, size);
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
      return extractImageBuffer(
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

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const apiKey = getOpenAiKey();
  const primaryModel = ENV.openaiImageModel;
  const size = normalizeImageSize(options.size);

  try {
    const buffer = await generateWithModel(
      apiKey,
      primaryModel,
      options.prompt,
      size
    );
    const url = await saveImageBuffer(buffer, `post-${Date.now()}.png`);
    return { url };
  } catch (primaryError) {
    const message =
      primaryError instanceof Error ? primaryError.message : String(primaryError);

    if (
      primaryModel !== FALLBACK_IMAGE_MODEL &&
      (isTimeoutError(message) || /\((503|504|502)\)/.test(message))
    ) {
      console.warn(
        `[imageGeneration] ${primaryModel} failed, fallback to ${FALLBACK_IMAGE_MODEL}`
      );
      const buffer = await generateWithModel(
        apiKey,
        FALLBACK_IMAGE_MODEL,
        options.prompt,
        size
      );
      const url = await saveImageBuffer(buffer, `post-${Date.now()}.png`);
      return { url };
    }

    throw primaryError;
  }
}
