export const AI_IMAGE_STYLES = [
  {
    id: "professional",
    name: "Professionnel",
    description: "Corporate, épuré, adapté LinkedIn",
    icon: "💼",
    preview: "bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900",
  },
  {
    id: "minimal",
    name: "Minimaliste",
    description: "Design simple et élégant",
    icon: "✨",
    preview: "bg-gradient-to-br from-gray-100 via-white to-slate-200",
  },
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Illustration colorée et dynamique",
    icon: "🎨",
    preview: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500",
  },
  {
    id: "abstract",
    name: "Abstrait",
    description: "Formes géométriques et couleurs vives",
    icon: "🔷",
    preview: "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400",
  },
  {
    id: "tech",
    name: "Tech & Innovation",
    description: "Futuriste et digital",
    icon: "🚀",
    preview: "bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Paysages et éléments organiques",
    icon: "🌿",
    preview: "bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800",
  },
] as const;

export type AiImageStyleId = (typeof AI_IMAGE_STYLES)[number]["id"];

export const AI_IMAGE_FORMATS = [
  {
    id: "1536x1024",
    name: "Large",
    description: "Format paysage — idéal pour LinkedIn",
    aspect: "aspect-[3/2]",
  },
  {
    id: "1024x1024",
    name: "Carré",
    description: "Format carré classique",
    aspect: "aspect-square",
  },
] as const;

export type AiImageFormatId = (typeof AI_IMAGE_FORMATS)[number]["id"];
