/** Stub Puppeteer pour Vercel serverless (Chromium indisponible). */
const disabled = async () => {
  throw new Error("Puppeteer indisponible sur Vercel — utilisez les images IA.");
};

export default {
  launch: disabled,
};
