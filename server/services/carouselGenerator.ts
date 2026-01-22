/**
 * Carousel Generator Service
 * 
 * Generates LinkedIn carousel slides as PDF or images
 * Uses Puppeteer to render HTML slides to images
 */

import puppeteer from "puppeteer";
import { storagePut } from "../storage";
import { generateLinkedInPost } from "./ai";

// Carousel slide types
export type SlideType = "title" | "content" | "list" | "quote" | "cta" | "stats";

export interface CarouselSlide {
  type: SlideType;
  title?: string;
  content?: string;
  items?: string[];
  quote?: string;
  author?: string;
  stat?: string;
  statLabel?: string;
  backgroundGradient?: string;
  accentColor?: string;
}

export interface CarouselConfig {
  topic: string;
  slideCount: number;
  style: "modern" | "minimal" | "bold" | "gradient";
  primaryColor: string;
  secondaryColor: string;
  authorName: string;
  authorTitle?: string;
  authorAvatar?: string;
  includeSwipeIndicator: boolean;
}

export interface GeneratedCarousel {
  slides: CarouselSlide[];
  imageUrls: string[];
  pdfUrl?: string;
}

// Color palettes for different styles
const COLOR_PALETTES = {
  modern: {
    backgrounds: [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    ],
    text: "#ffffff",
    accent: "#ffd700",
  },
  minimal: {
    backgrounds: [
      "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
      "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
    ],
    text: "#212529",
    accent: "#0066cc",
  },
  bold: {
    backgrounds: [
      "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
      "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)",
      "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
    ],
    text: "#ffffff",
    accent: "#ffeb3b",
  },
  gradient: {
    backgrounds: [
      "linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)",
      "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
      "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
    ],
    text: "#ffffff",
    accent: "#ffffff",
  },
};

/**
 * Generate carousel content using AI
 */
export async function generateCarouselContent(
  topic: string,
  slideCount: number = 7
): Promise<CarouselSlide[]> {
  // Generate the carousel content using AI
  const content = await generateLinkedInPost({
    topic,
    contentFormat: "carousel",
    tone: "educational",
    language: "FR",
  });

  // Parse the AI-generated content into slides
  const slides = parseCarouselContent(content, topic, slideCount);
  
  return slides;
}

/**
 * Parse AI-generated content into structured slides
 */
function parseCarouselContent(
  content: string, 
  topic: string,
  targetSlideCount: number
): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  
  // Title slide
  slides.push({
    type: "title",
    title: extractTitle(content, topic),
    content: extractSubtitle(content),
    backgroundGradient: COLOR_PALETTES.modern.backgrounds[0],
  });

  // Parse numbered points from content
  const points = extractNumberedPoints(content);
  
  // Create content slides for each point
  for (let i = 0; i < Math.min(points.length, targetSlideCount - 2); i++) {
    const point = points[i];
    slides.push({
      type: "content",
      title: `${i + 1}. ${point.title}`,
      content: point.description,
      backgroundGradient: COLOR_PALETTES.modern.backgrounds[(i + 1) % COLOR_PALETTES.modern.backgrounds.length],
    });
  }

  // CTA slide
  slides.push({
    type: "cta",
    title: "Envie d'en savoir plus ?",
    content: "Suivez-moi pour plus de conseils !",
    items: ["👍 Like si utile", "💬 Commentez vos questions", "🔄 Partagez à votre réseau"],
    backgroundGradient: COLOR_PALETTES.modern.backgrounds[3],
  });

  return slides;
}

/**
 * Extract title from content
 */
function extractTitle(content: string, fallbackTopic: string): string {
  // Try to find a title pattern
  const titleMatch = content.match(/^#?\s*(.+?)[\n\r]/);
  if (titleMatch) {
    return titleMatch[1].replace(/[#*]/g, "").trim();
  }
  
  // Try to find "Slide 1:" pattern
  const slideMatch = content.match(/Slide\s*1[:\s]+(.+?)[\n\r]/i);
  if (slideMatch) {
    return slideMatch[1].trim();
  }
  
  return fallbackTopic;
}

/**
 * Extract subtitle from content
 */
function extractSubtitle(content: string): string {
  const lines = content.split("\n").filter(l => l.trim());
  if (lines.length > 1) {
    const subtitle = lines[1].replace(/[#*-]/g, "").trim();
    if (subtitle.length < 100) {
      return subtitle;
    }
  }
  return "Guide pratique en quelques slides";
}

/**
 * Extract numbered points from content
 */
function extractNumberedPoints(content: string): Array<{ title: string; description: string }> {
  const points: Array<{ title: string; description: string }> = [];
  
  // Match patterns like "1.", "1)", "Slide 2:", "- Point 1"
  const patterns = [
    /(?:^|\n)\s*(\d+)[.)]\s*(.+?)(?=\n\s*\d+[.)]|\n\n|$)/g,
    /(?:^|\n)\s*Slide\s*(\d+)[:\s]+(.+?)(?=\nSlide|\n\n|$)/gi,
    /(?:^|\n)\s*[-•]\s*(.+?)(?=\n[-•]|\n\n|$)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[2] || match[1];
      if (text) {
        const parts = text.split(/[:\-–]/).map(p => p.trim());
        points.push({
          title: parts[0] || text.substring(0, 50),
          description: parts.slice(1).join(" ") || "",
        });
      }
    }
    if (points.length > 0) break;
  }

  // If no structured points found, split by paragraphs
  if (points.length === 0) {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
    for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
      const para = paragraphs[i].trim();
      points.push({
        title: para.substring(0, 50) + (para.length > 50 ? "..." : ""),
        description: para.length > 50 ? para.substring(50, 150) : "",
      });
    }
  }

  return points;
}

/**
 * Generate HTML for a single slide
 */
function generateSlideHTML(
  slide: CarouselSlide, 
  config: CarouselConfig,
  slideIndex: number,
  totalSlides: number
): string {
  const palette = COLOR_PALETTES[config.style];
  const bgGradient = slide.backgroundGradient || 
    palette.backgrounds[slideIndex % palette.backgrounds.length];
  
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        width: 1080px;
        height: 1350px;
        background: ${bgGradient};
        color: ${palette.text};
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 80px;
        position: relative;
        overflow: hidden;
      }
      
      .slide-number {
        position: absolute;
        top: 40px;
        right: 40px;
        font-size: 24px;
        font-weight: 600;
        opacity: 0.8;
      }
      
      .swipe-indicator {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
      }
      
      .swipe-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${palette.text};
        opacity: 0.3;
      }
      
      .swipe-dot.active {
        opacity: 1;
        width: 36px;
        border-radius: 6px;
      }
      
      .title {
        font-size: 72px;
        font-weight: 800;
        text-align: center;
        line-height: 1.1;
        margin-bottom: 40px;
        text-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
      
      .subtitle {
        font-size: 36px;
        font-weight: 500;
        text-align: center;
        opacity: 0.9;
        max-width: 800px;
      }
      
      .content-title {
        font-size: 56px;
        font-weight: 700;
        text-align: left;
        line-height: 1.2;
        margin-bottom: 40px;
        width: 100%;
      }
      
      .content-text {
        font-size: 36px;
        font-weight: 400;
        line-height: 1.6;
        opacity: 0.9;
        width: 100%;
      }
      
      .list-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      
      .list-item {
        font-size: 32px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px 32px;
        background: rgba(255,255,255,0.15);
        border-radius: 16px;
        backdrop-filter: blur(10px);
      }
      
      .quote-text {
        font-size: 48px;
        font-weight: 600;
        font-style: italic;
        text-align: center;
        line-height: 1.4;
        max-width: 900px;
      }
      
      .quote-author {
        font-size: 28px;
        font-weight: 500;
        margin-top: 40px;
        opacity: 0.8;
      }
      
      .stat-number {
        font-size: 120px;
        font-weight: 800;
        color: ${palette.accent};
        text-shadow: 0 4px 30px rgba(0,0,0,0.3);
      }
      
      .stat-label {
        font-size: 36px;
        font-weight: 500;
        margin-top: 20px;
        opacity: 0.9;
      }
      
      .author-box {
        position: absolute;
        bottom: 100px;
        left: 80px;
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .author-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }
      
      .author-info {
        display: flex;
        flex-direction: column;
      }
      
      .author-name {
        font-size: 24px;
        font-weight: 600;
      }
      
      .author-title {
        font-size: 18px;
        opacity: 0.8;
      }
      
      .decoration {
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        filter: blur(60px);
      }
      
      .decoration-1 { top: -100px; right: -100px; }
      .decoration-2 { bottom: -100px; left: -100px; }
    </style>
  `;

  let slideContent = "";
  
  switch (slide.type) {
    case "title":
      slideContent = `
        <div class="title">${slide.title}</div>
        ${slide.content ? `<div class="subtitle">${slide.content}</div>` : ""}
      `;
      break;
      
    case "content":
      slideContent = `
        <div class="content-title">${slide.title}</div>
        ${slide.content ? `<div class="content-text">${slide.content}</div>` : ""}
      `;
      break;
      
    case "list":
      slideContent = `
        ${slide.title ? `<div class="content-title">${slide.title}</div>` : ""}
        <div class="list-container">
          ${(slide.items || []).map(item => `
            <div class="list-item">
              <span>✓</span>
              <span>${item}</span>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    case "quote":
      slideContent = `
        <div class="quote-text">"${slide.quote}"</div>
        ${slide.author ? `<div class="quote-author">— ${slide.author}</div>` : ""}
      `;
      break;
      
    case "stats":
      slideContent = `
        <div class="stat-number">${slide.stat}</div>
        <div class="stat-label">${slide.statLabel}</div>
      `;
      break;
      
    case "cta":
      slideContent = `
        <div class="title" style="font-size: 56px;">${slide.title}</div>
        ${slide.content ? `<div class="subtitle" style="margin-bottom: 40px;">${slide.content}</div>` : ""}
        ${slide.items ? `
          <div class="list-container">
            ${slide.items.map(item => `
              <div class="list-item">
                <span>${item}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      `;
      break;
  }

  // Swipe indicator dots
  const swipeDots = config.includeSwipeIndicator ? `
    <div class="swipe-indicator">
      ${Array.from({ length: totalSlides }, (_, i) => `
        <div class="swipe-dot ${i === slideIndex ? 'active' : ''}"></div>
      `).join("")}
    </div>
  ` : "";

  // Author box (only on first and last slides)
  const authorBox = (slideIndex === 0 || slideIndex === totalSlides - 1) ? `
    <div class="author-box">
      <div class="author-avatar">${config.authorAvatar || config.authorName.charAt(0)}</div>
      <div class="author-info">
        <div class="author-name">${config.authorName}</div>
        ${config.authorTitle ? `<div class="author-title">${config.authorTitle}</div>` : ""}
      </div>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${baseStyles}
    </head>
    <body>
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="slide-number">${slideIndex + 1}/${totalSlides}</div>
      ${slideContent}
      ${authorBox}
      ${swipeDots}
    </body>
    </html>
  `;
}

/**
 * Render carousel slides to images
 */
export async function renderCarouselToImages(
  slides: CarouselSlide[],
  config: CarouselConfig
): Promise<string[]> {
  console.log("[CarouselGenerator] Starting image rendering for", slides.length, "slides");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    timeout: 60000,
  });

  const imageUrls: string[] = [];

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    await page.setViewport({ width: 1080, height: 1350 });

    for (let i = 0; i < slides.length; i++) {
      console.log(`[CarouselGenerator] Rendering slide ${i + 1}/${slides.length}`);
      
      const html = generateSlideHTML(slides[i], config, i, slides.length);
      await page.setContent(html, { 
        waitUntil: "domcontentloaded",
        timeout: 30000
      });
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const imageBuffer = await page.screenshot({ 
        type: "png",
        fullPage: false,
      });

      // Upload to S3
      const fileName = `carousels/${Date.now()}_slide_${i + 1}.png`;
      console.log(`[CarouselGenerator] Uploading slide ${i + 1} to S3...`);
      const result = await storagePut(fileName, imageBuffer, "image/png");
      imageUrls.push(result.url);
      console.log(`[CarouselGenerator] Slide ${i + 1} uploaded:`, result.url);
    }
  } catch (error) {
    console.error("[CarouselGenerator] Error rendering slides:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("[CarouselGenerator] All slides rendered successfully");
  return imageUrls;
}

/**
 * Generate a complete carousel
 */
export async function generateCarousel(
  config: CarouselConfig
): Promise<GeneratedCarousel> {
  // Generate content
  const slides = await generateCarouselContent(config.topic, config.slideCount);
  
  // Render to images
  const imageUrls = await renderCarouselToImages(slides, config);
  
  return {
    slides,
    imageUrls,
  };
}
