import { invokeLLM } from "../_core/llm";
import { resolvePublicUrl } from "../_core/publicUrl";
import { generateImageBuffer, normalizeImageSize } from "../_core/imageGeneration";
import { persistAiGeneratedImage } from "./postAssetService";

function extractText(
  content: string | Array<{ text?: string }> | undefined
): string {
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  return content.map((part) => part.text ?? "").join("").trim();
}

const VISUAL_STYLE_HINTS: Record<string, string> = {
  professional: "corporate, clean, muted colors, business illustration",
  abstract: "abstract geometric shapes, bold colors, artistic composition",
  minimal: "minimalist, lots of white space, simple elegant shapes",
  cartoon: "playful cartoon illustration, flat design, vibrant colors, friendly style",
  tech: "futuristic, digital, innovation, tech-inspired visuals",
  nature: "natural landscapes, organic elements, calming atmosphere",
  dynamic: "energetic, vibrant, high contrast, impactful composition",
};

export async function buildImagePromptFromPost(options: {
  content: string;
  title: string;
  suggestedMedia?: string;
  visualStyle?: string;
}): Promise<string> {
  const styleHint =
    VISUAL_STYLE_HINTS[options.visualStyle ?? "professional"] ??
    VISUAL_STYLE_HINTS.professional;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Tu crées des prompts pour Gemini Nano Banana (images LinkedIn premium).
Règles:
- Réponds UNIQUEMENT avec le prompt en anglais (max 800 caractères)
- Style visuel demandé: ${styleHint}
- Visuel WOW: composition cinématique, profondeur, éclairage dramatique, couleurs vibrantes mais élégantes
- Illustration professionnelle haut de gamme, moderne, qui arrête le scroll sur LinkedIn
- Pas de texte, logos ou watermark dans l'image
- Évite les visages réalistes identifiables`,
      },
      {
        role: "user",
        content: `Crée un prompt d'image pour ce post LinkedIn:

Titre: ${options.title}

Contenu:
${options.content.slice(0, 1200)}
${options.suggestedMedia ? `\nDirection visuelle suggérée: ${options.suggestedMedia}` : ""}`,
      },
    ],
    maxTokens: 300,
    temperature: 0.7,
  });

  const prompt = extractText(response.choices[0]?.message?.content);
  if (!prompt) {
    throw new Error("Impossible de générer le prompt visuel");
  }
  return prompt;
}

export async function generatePostImage(
  userId: number,
  options: {
    content: string;
    title: string;
    suggestedMedia?: string;
    visualStyle?: string;
    imageSize?: string;
    generatedPostId?: number;
  }
): Promise<{
  imageUrl: string;
  imageKey: string;
  mediaLibraryId: number;
  prompt: string;
}> {
  const prompt = await buildImagePromptFromPost(options);
  const buffer = await generateImageBuffer({
    prompt,
    size: normalizeImageSize(options.imageSize),
  });

  const asset = await persistAiGeneratedImage(userId, buffer, {
    title: options.title,
    prompt,
  });

  if (options.generatedPostId) {
    const { linkImageToGeneratedPost } = await import("./postAssetService");
    await linkImageToGeneratedPost(userId, options.generatedPostId, {
      ...asset,
      imagePrompt: prompt,
    });
  }

  return { ...asset, imageUrl: resolvePublicUrl(asset.imageUrl), prompt };
}
