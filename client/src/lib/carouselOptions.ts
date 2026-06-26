export const CAROUSEL_STYLES = [
  { id: "modern", name: "Moderne", description: "Dégradés colorés et design contemporain", preview: "bg-gradient-to-br from-violet-600 to-pink-500" },
  { id: "minimal", name: "Minimaliste", description: "Design épuré sur fond clair", preview: "bg-gradient-to-br from-gray-100 to-white" },
  { id: "bold", name: "Audacieux", description: "Couleurs vives et contrastes forts", preview: "bg-gradient-to-br from-red-500 to-orange-500" },
  { id: "gradient", name: "Gradient", description: "Dégradés multi-couleurs spectaculaires", preview: "bg-gradient-to-br from-cyan-500 via-purple-500 to-amber-500" },
] as const;

export const CAROUSEL_SLIDE_COUNTS = [5, 7, 10, 12] as const;

export type CarouselStyleId = (typeof CAROUSEL_STYLES)[number]["id"];
