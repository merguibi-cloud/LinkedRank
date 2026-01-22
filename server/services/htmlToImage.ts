/**
 * HTML to Image rendering service using Puppeteer
 * Renders quote cards as PNG images with exact HTML/CSS styling
 * Multiple professional templates for variety
 */

import puppeteer from "puppeteer";
import { storagePut } from "../storage";

export interface QuoteImageOptions {
  quote: string;
  authorName: string;
  style?: "gradient" | "minimal" | "bold" | "elegant" | "modern";
  colorPalette?: string;
  colors?: string[];
}

// Color palettes matching the frontend
const COLOR_PALETTES: Record<string, { primary: string; secondary: string; text: string; accent: string }> = {
  violet: { primary: "#8B5CF6", secondary: "#EC4899", text: "#FFFFFF", accent: "#F3E8FF" },
  ocean: { primary: "#0EA5E9", secondary: "#06B6D4", text: "#FFFFFF", accent: "#E0F2FE" },
  sunset: { primary: "#F97316", secondary: "#EF4444", text: "#FFFFFF", accent: "#FFF7ED" },
  forest: { primary: "#10B981", secondary: "#059669", text: "#FFFFFF", accent: "#ECFDF5" },
  royal: { primary: "#6366F1", secondary: "#8B5CF6", text: "#FFFFFF", accent: "#EEF2FF" },
  fire: { primary: "#EF4444", secondary: "#F97316", text: "#FFFFFF", accent: "#FEF2F2" },
  midnight: { primary: "#1E293B", secondary: "#334155", text: "#FFFFFF", accent: "#F8FAFC" },
  gold: { primary: "#F59E0B", secondary: "#D97706", text: "#1F2937", accent: "#FFFBEB" },
  linkedin: { primary: "#0A66C2", secondary: "#004182", text: "#FFFFFF", accent: "#E7F3FF" },
  dark: { primary: "#18181B", secondary: "#27272A", text: "#FFFFFF", accent: "#F4F4F5" },
};

/**
 * Template 1: Gradient (default) - Modern gradient background with quote marks
 */
function templateGradient(quote: string, authorName: string, palette: typeof COLOR_PALETTES.violet): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px;
    }
    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
    }
    .quote-mark {
      font-size: 200px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.12);
      line-height: 1;
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
    }
    .quote-text {
      font-size: 48px;
      font-weight: 700;
      color: ${palette.text};
      line-height: 1.35;
      max-width: 100%;
      margin-bottom: 50px;
      text-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
      z-index: 1;
    }
    .divider {
      width: 100px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      margin-bottom: 35px;
      border-radius: 2px;
    }
    .author {
      font-size: 28px;
      font-weight: 600;
      color: ${palette.text};
      opacity: 0.9;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="quote-mark">"</div>
    <p class="quote-text">${escapeHtml(quote)}</p>
    <div class="divider"></div>
    <p class="author">${escapeHtml(authorName)}</p>
  </div>
</body>
</html>`;
}

/**
 * Template 2: Minimal - Clean white background with colored accent
 */
function templateMinimal(quote: string, authorName: string, palette: typeof COLOR_PALETTES.violet): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Inter', sans-serif;
      background: #FAFAFA;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px;
    }
    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      position: relative;
    }
    .accent-bar {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 300px;
      background: linear-gradient(180deg, ${palette.primary} 0%, ${palette.secondary} 100%);
      border-radius: 4px;
    }
    .content {
      padding-left: 60px;
    }
    .quote-text {
      font-family: 'Playfair Display', serif;
      font-size: 52px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.4;
      margin-bottom: 50px;
      font-style: italic;
    }
    .author {
      font-size: 24px;
      font-weight: 500;
      color: ${palette.primary};
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="accent-bar"></div>
    <div class="content">
      <p class="quote-text">"${escapeHtml(quote)}"</p>
      <p class="author">— ${escapeHtml(authorName)}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template 3: Bold - Strong typography with geometric shapes
 */
function templateBold(quote: string, authorName: string, palette: typeof COLOR_PALETTES.violet): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Montserrat', sans-serif;
      background: ${palette.primary};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px;
      position: relative;
      overflow: hidden;
    }
    .shape1 {
      position: absolute;
      width: 400px;
      height: 400px;
      background: ${palette.secondary};
      opacity: 0.3;
      border-radius: 50%;
      top: -100px;
      right: -100px;
    }
    .shape2 {
      position: absolute;
      width: 300px;
      height: 300px;
      background: ${palette.secondary};
      opacity: 0.2;
      border-radius: 50%;
      bottom: -50px;
      left: -50px;
    }
    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      z-index: 1;
    }
    .quote-text {
      font-size: 50px;
      font-weight: 800;
      color: ${palette.text};
      line-height: 1.3;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 50px;
    }
    .author-box {
      background: ${palette.text};
      padding: 15px 40px;
      border-radius: 50px;
    }
    .author {
      font-size: 22px;
      font-weight: 700;
      color: ${palette.primary};
      letter-spacing: 3px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="shape1"></div>
  <div class="shape2"></div>
  <div class="card">
    <p class="quote-text">${escapeHtml(quote)}</p>
    <div class="author-box">
      <p class="author">${escapeHtml(authorName)}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template 4: Elegant - Sophisticated dark theme with gold accents
 */
function templateElegant(quote: string, authorName: string, palette: typeof COLOR_PALETTES.violet): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Inter', sans-serif;
      background: #0F0F0F;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px;
      position: relative;
    }
    .border {
      position: absolute;
      top: 40px;
      left: 40px;
      right: 40px;
      bottom: 40px;
      border: 1px solid ${palette.primary};
      opacity: 0.4;
    }
    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .quote-icon {
      font-size: 60px;
      color: ${palette.primary};
      margin-bottom: 40px;
    }
    .quote-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      font-weight: 500;
      color: #FFFFFF;
      line-height: 1.5;
      margin-bottom: 50px;
      font-style: italic;
    }
    .divider {
      width: 60px;
      height: 2px;
      background: ${palette.primary};
      margin-bottom: 30px;
    }
    .author {
      font-size: 20px;
      font-weight: 300;
      color: ${palette.primary};
      letter-spacing: 5px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="border"></div>
  <div class="card">
    <div class="quote-icon">❝</div>
    <p class="quote-text">${escapeHtml(quote)}</p>
    <div class="divider"></div>
    <p class="author">${escapeHtml(authorName)}</p>
  </div>
</body>
</html>`;
}

/**
 * Template 5: Modern - Contemporary design with asymmetric layout
 */
function templateModern(quote: string, authorName: string, palette: typeof COLOR_PALETTES.violet): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(180deg, #FFFFFF 0%, ${palette.accent} 100%);
      display: flex;
      padding: 80px;
      position: relative;
    }
    .left-bar {
      width: 20px;
      height: 100%;
      background: linear-gradient(180deg, ${palette.primary} 0%, ${palette.secondary} 100%);
      border-radius: 10px;
      margin-right: 60px;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .quote-text {
      font-size: 46px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.4;
      margin-bottom: 50px;
    }
    .author-section {
      display: flex;
      align-items: center;
    }
    .author-line {
      width: 50px;
      height: 3px;
      background: ${palette.primary};
      margin-right: 20px;
    }
    .author {
      font-size: 24px;
      font-weight: 500;
      color: ${palette.primary};
    }
  </style>
</head>
<body>
  <div class="left-bar"></div>
  <div class="content">
    <p class="quote-text">"${escapeHtml(quote)}"</p>
    <div class="author-section">
      <div class="author-line"></div>
      <p class="author">${escapeHtml(authorName)}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML based on selected style
 */
function generateQuoteHTML(options: QuoteImageOptions): string {
  const { quote, authorName, style = "gradient", colorPalette = "violet", colors } = options;
  
  // Get colors from palette or use custom colors
  const palette = COLOR_PALETTES[colorPalette.toLowerCase()] || COLOR_PALETTES.violet;
  if (colors?.[0]) palette.primary = colors[0];
  if (colors?.[1]) palette.secondary = colors[1];

  switch (style) {
    case "minimal":
      return templateMinimal(quote, authorName, palette);
    case "bold":
      return templateBold(quote, authorName, palette);
    case "elegant":
      return templateElegant(quote, authorName, palette);
    case "modern":
      return templateModern(quote, authorName, palette);
    case "gradient":
    default:
      return templateGradient(quote, authorName, palette);
  }
}

/**
 * Render HTML to PNG image using Puppeteer
 */
export async function renderQuoteImage(options: QuoteImageOptions): Promise<{ url: string }> {
  // Pick a random style if not specified for variety
  const styles: Array<"gradient" | "minimal" | "bold" | "elegant" | "modern"> = ["gradient", "minimal", "bold", "elegant", "modern"];
  const finalOptions = {
    ...options,
    style: options.style || styles[Math.floor(Math.random() * styles.length)]
  };
  
  const html = generateQuoteHTML(finalOptions);
  
  let browser;
  try {
    console.log("[htmlToImage] Launching Puppeteer...");
    console.log("[htmlToImage] Style:", finalOptions.style);
    console.log("[htmlToImage] Palette:", finalOptions.colorPalette);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport to match image size
    await page.setViewport({
      width: 1080,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Set HTML content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Small delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take screenshot
    console.log("[htmlToImage] Taking screenshot...");
    const screenshot = await page.screenshot({
      type: "png",
      encoding: "binary",
    });

    // Upload to S3
    console.log("[htmlToImage] Uploading to S3...");
    const filename = `quote-${Date.now()}.png`;
    const result = await storagePut(`generated/${filename}`, screenshot as Buffer, "image/png");

    console.log("[htmlToImage] Image generated successfully:", result.url);
    return { url: result.url };
  } catch (error) {
    console.error("[htmlToImage] Error rendering image:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Render custom HTML to PNG (for advanced use cases)
 */
export async function renderCustomHTML(html: string, width = 1080, height = 1080): Promise<{ url: string }> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 500));

    const screenshot = await page.screenshot({ type: "png", encoding: "binary" });
    const filename = `custom-${Date.now()}.png`;
    const result = await storagePut(`generated/${filename}`, screenshot as Buffer, "image/png");

    return { url: result.url };
  } catch (error) {
    console.error("[htmlToImage] Error rendering custom HTML:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
