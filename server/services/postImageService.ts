import { invokeLLM } from "../_core/llm";
import { generateImage, normalizeImageSize } from "../_core/imageGeneration";

function extractText(
  content: string | Array<{ text?: string }> | undefined
): string {
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  return content.map(part => part.text ?? "").join("").trim();
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
        content: `Tu crées des prompts pour DALL-E (images LinkedIn professionnelles).
Règles:
- Réponds UNIQUEMENT avec le prompt en anglais (max 800 caractères)
- Style visuel demandé: ${styleHint}
- Illustration professionnelle, moderne, adaptée à LinkedIn
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

export async function generatePostImage(options: {
  content: string;
  title: string;
  suggestedMedia?: string;
  visualStyle?: string;
  imageSize?: string;
}): Promise<{ imageUrl: string; prompt: string }> {
  const prompt = await buildImagePromptFromPost(options);
  const { url } = await generateImage({
    prompt,
    size: normalizeImageSize(options.imageSize),
  });
  return { imageUrl: url, prompt };
}
