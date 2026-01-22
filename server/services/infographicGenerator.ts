/**
 * Infographic Generator Service
 * 
 * Generates LinkedIn infographics with data visualizations
 * Uses Puppeteer to render HTML/CSS to images
 */

import puppeteer from "puppeteer";
import { storagePut } from "../storage";
import { generateLinkedInPost } from "./ai";

// Infographic types
export type InfographicType = "stats" | "timeline" | "comparison" | "process" | "list" | "chart";

export interface InfographicData {
  type: InfographicType;
  title: string;
  subtitle?: string;
  items: InfographicItem[];
  footer?: string;
  source?: string;
}

export interface InfographicItem {
  label: string;
  value?: string | number;
  description?: string;
  icon?: string;
  color?: string;
  percentage?: number;
}

export interface InfographicConfig {
  topic: string;
  type: InfographicType;
  style: "modern" | "corporate" | "creative" | "minimal";
  primaryColor: string;
  secondaryColor: string;
  authorName: string;
  authorTitle?: string;
}

// Color schemes
const COLOR_SCHEMES = {
  modern: {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#F59E0B",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    text: "#ffffff",
    muted: "#94a3b8",
  },
  corporate: {
    primary: "#0066CC",
    secondary: "#00A3E0",
    accent: "#FFB81C",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    text: "#1e293b",
    muted: "#64748b",
  },
  creative: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    text: "#ffffff",
    muted: "#e2e8f0",
  },
  minimal: {
    primary: "#18181b",
    secondary: "#71717a",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#18181b",
    muted: "#a1a1aa",
  },
};

/**
 * Generate infographic content using AI
 */
export async function generateInfographicContent(
  topic: string,
  type: InfographicType
): Promise<InfographicData> {
  // Generate content using AI
  const content = await generateLinkedInPost({
    topic,
    contentFormat: "infographic",
    tone: "educational",
    language: "FR",
  });

  // Parse the content into structured data
  return parseInfographicContent(content, topic, type);
}

/**
 * Parse AI content into infographic data
 */
function parseInfographicContent(
  content: string,
  topic: string,
  type: InfographicType
): InfographicData {
  const items: InfographicItem[] = [];
  
  // Extract numbers and statistics from content
  const statMatches = content.match(/(\d+(?:[.,]\d+)?)\s*%?/g) || [];
  const lines = content.split("\n").filter(l => l.trim());
  
  // Generate items based on type
  switch (type) {
    case "stats":
      // Extract key statistics
      for (let i = 0; i < Math.min(statMatches.length, 4); i++) {
        items.push({
          label: extractLabelForStat(lines, i),
          value: statMatches[i],
          icon: getIconForIndex(i),
          color: getColorForIndex(i),
        });
      }
      // Fill with defaults if not enough stats
      while (items.length < 4) {
        items.push({
          label: `Statistique ${items.length + 1}`,
          value: `${Math.floor(Math.random() * 90) + 10}%`,
          icon: getIconForIndex(items.length),
          color: getColorForIndex(items.length),
        });
      }
      break;
      
    case "timeline":
      // Create timeline items
      const timelinePoints = extractBulletPoints(content);
      for (let i = 0; i < Math.min(timelinePoints.length, 5); i++) {
        items.push({
          label: `Étape ${i + 1}`,
          description: timelinePoints[i],
          icon: `${i + 1}`,
        });
      }
      break;
      
    case "comparison":
      // Create comparison items
      items.push(
        { label: "Option A", value: "85%", description: "Avantages principaux", color: "#10B981" },
        { label: "Option B", value: "65%", description: "Alternative", color: "#F59E0B" }
      );
      break;
      
    case "process":
      // Create process steps
      const processSteps = extractBulletPoints(content);
      for (let i = 0; i < Math.min(processSteps.length, 5); i++) {
        items.push({
          label: processSteps[i].substring(0, 50),
          icon: `${i + 1}`,
          color: getColorForIndex(i),
        });
      }
      break;
      
    case "list":
      // Create list items
      const listItems = extractBulletPoints(content);
      for (let i = 0; i < Math.min(listItems.length, 6); i++) {
        items.push({
          label: listItems[i],
          icon: "✓",
          color: getColorForIndex(i),
        });
      }
      break;
      
    case "chart":
      // Create chart data
      for (let i = 0; i < 5; i++) {
        items.push({
          label: `Catégorie ${i + 1}`,
          percentage: Math.floor(Math.random() * 60) + 20,
          color: getColorForIndex(i),
        });
      }
      break;
  }

  return {
    type,
    title: extractTitle(content, topic),
    subtitle: extractSubtitle(content),
    items,
    source: "LinkedRank Analytics",
  };
}

/**
 * Extract bullet points from content
 */
function extractBulletPoints(content: string): string[] {
  const points: string[] = [];
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[-•*\d.)\]]\s*/) || trimmed.match(/^\d+[.)]/)) {
      const cleaned = trimmed.replace(/^[-•*\d.)\]]\s*/, "").trim();
      if (cleaned.length > 5 && cleaned.length < 200) {
        points.push(cleaned);
      }
    }
  }
  
  // If no bullet points found, split by sentences
  if (points.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 5).map(s => s.trim());
  }
  
  return points;
}

/**
 * Extract title from content
 */
function extractTitle(content: string, fallback: string): string {
  const firstLine = content.split("\n")[0];
  if (firstLine && firstLine.length < 80) {
    return firstLine.replace(/[#*]/g, "").trim();
  }
  return fallback;
}

/**
 * Extract subtitle from content
 */
function extractSubtitle(content: string): string {
  const lines = content.split("\n").filter(l => l.trim());
  if (lines.length > 1 && lines[1].length < 100) {
    return lines[1].replace(/[#*]/g, "").trim();
  }
  return "Données clés à retenir";
}

/**
 * Extract label for a statistic
 */
function extractLabelForStat(lines: string[], index: number): string {
  const labels = [
    "Croissance", "Performance", "Engagement", "Conversion",
    "Satisfaction", "Productivité", "ROI", "Efficacité"
  ];
  
  // Try to find a relevant label from content
  if (lines[index] && lines[index].length < 50) {
    return lines[index].replace(/[#*\d%]/g, "").trim().substring(0, 30) || labels[index % labels.length];
  }
  
  return labels[index % labels.length];
}

/**
 * Get icon for index
 */
function getIconForIndex(index: number): string {
  const icons = ["📈", "🎯", "💡", "🚀", "⭐", "💪", "🔥", "✨"];
  return icons[index % icons.length];
}

/**
 * Get color for index
 */
function getColorForIndex(index: number): string {
  const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
  return colors[index % colors.length];
}

/**
 * Generate HTML for infographic
 */
function generateInfographicHTML(
  data: InfographicData,
  config: InfographicConfig
): string {
  const scheme = COLOR_SCHEMES[config.style];
  
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
        background: ${scheme.background};
        color: ${scheme.text};
        padding: 60px;
        position: relative;
        overflow: hidden;
      }
      
      .header {
        text-align: center;
        margin-bottom: 50px;
      }
      
      .title {
        font-size: 52px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 16px;
        background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .subtitle {
        font-size: 24px;
        color: ${scheme.muted};
        font-weight: 500;
      }
      
      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      
      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        padding: 20px 0;
      }
      
      .stat-card {
        background: ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)'};
        border-radius: 24px;
        padding: 40px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .stat-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .stat-value {
        font-size: 64px;
        font-weight: 800;
        background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        margin-bottom: 12px;
      }
      
      .stat-label {
        font-size: 20px;
        color: ${scheme.muted};
        font-weight: 500;
      }
      
      /* Timeline */
      .timeline {
        position: relative;
        padding-left: 60px;
      }
      
      .timeline::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, ${scheme.primary}, ${scheme.secondary});
        border-radius: 2px;
      }
      
      .timeline-item {
        position: relative;
        padding: 24px 0;
        padding-left: 40px;
      }
      
      .timeline-dot {
        position: absolute;
        left: -48px;
        top: 28px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${scheme.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
        color: white;
      }
      
      .timeline-content {
        background: ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)'};
        border-radius: 16px;
        padding: 24px;
      }
      
      .timeline-label {
        font-size: 18px;
        font-weight: 700;
        color: ${scheme.primary};
        margin-bottom: 8px;
      }
      
      .timeline-desc {
        font-size: 16px;
        color: ${scheme.muted};
        line-height: 1.5;
      }
      
      /* Process */
      .process {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .process-step {
        display: flex;
        align-items: center;
        gap: 20px;
        background: ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)'};
        border-radius: 16px;
        padding: 24px;
      }
      
      .process-number {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary});
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 24px;
        color: white;
        flex-shrink: 0;
      }
      
      .process-text {
        font-size: 20px;
        font-weight: 500;
        line-height: 1.4;
      }
      
      /* List */
      .list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .list-item {
        display: flex;
        align-items: center;
        gap: 16px;
        background: ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.1)'};
        border-radius: 12px;
        padding: 20px 24px;
      }
      
      .list-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${scheme.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: white;
        flex-shrink: 0;
      }
      
      .list-text {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.4;
      }
      
      /* Chart */
      .chart {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px 0;
      }
      
      .chart-bar {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .chart-label {
        width: 120px;
        font-size: 16px;
        font-weight: 500;
        text-align: right;
      }
      
      .chart-track {
        flex: 1;
        height: 40px;
        background: ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'};
        border-radius: 20px;
        overflow: hidden;
      }
      
      .chart-fill {
        height: 100%;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 16px;
        font-weight: 700;
        font-size: 16px;
        color: white;
      }
      
      /* Footer */
      .footer {
        position: absolute;
        bottom: 40px;
        left: 60px;
        right: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
        border-top: 1px solid ${config.style === 'corporate' || config.style === 'minimal' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
      }
      
      .author {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary});
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20px;
        color: white;
      }
      
      .author-name {
        font-weight: 600;
        font-size: 18px;
      }
      
      .author-title {
        font-size: 14px;
        color: ${scheme.muted};
      }
      
      .source {
        font-size: 14px;
        color: ${scheme.muted};
      }
      
      /* Decorations */
      .decoration {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
      }
      
      .decoration-1 {
        width: 300px;
        height: 300px;
        background: ${scheme.primary};
        top: -100px;
        right: -100px;
        filter: blur(60px);
      }
      
      .decoration-2 {
        width: 200px;
        height: 200px;
        background: ${scheme.secondary};
        bottom: 100px;
        left: -50px;
        filter: blur(40px);
      }
    </style>
  `;

  let contentHTML = "";
  
  switch (data.type) {
    case "stats":
      contentHTML = `
        <div class="stats-grid">
          ${data.items.map(item => `
            <div class="stat-card">
              <div class="stat-icon">${item.icon}</div>
              <div class="stat-value">${item.value}</div>
              <div class="stat-label">${item.label}</div>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    case "timeline":
      contentHTML = `
        <div class="timeline">
          ${data.items.map((item, i) => `
            <div class="timeline-item">
              <div class="timeline-dot">${i + 1}</div>
              <div class="timeline-content">
                <div class="timeline-label">${item.label}</div>
                <div class="timeline-desc">${item.description || ""}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    case "process":
      contentHTML = `
        <div class="process">
          ${data.items.map((item, i) => `
            <div class="process-step">
              <div class="process-number">${i + 1}</div>
              <div class="process-text">${item.label}</div>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    case "list":
      contentHTML = `
        <div class="list">
          ${data.items.map(item => `
            <div class="list-item">
              <div class="list-icon">${item.icon}</div>
              <div class="list-text">${item.label}</div>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    case "chart":
      contentHTML = `
        <div class="chart">
          ${data.items.map(item => `
            <div class="chart-bar">
              <div class="chart-label">${item.label}</div>
              <div class="chart-track">
                <div class="chart-fill" style="width: ${item.percentage}%; background: ${item.color};">
                  ${item.percentage}%
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
      break;
      
    default:
      contentHTML = `
        <div class="stats-grid">
          ${data.items.slice(0, 4).map(item => `
            <div class="stat-card">
              <div class="stat-icon">${item.icon || "📊"}</div>
              <div class="stat-value">${item.value || "N/A"}</div>
              <div class="stat-label">${item.label}</div>
            </div>
          `).join("")}
        </div>
      `;
  }

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
      
      <div class="header">
        <h1 class="title">${data.title}</h1>
        ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ""}
      </div>
      
      <div class="content">
        ${contentHTML}
      </div>
      
      <div class="footer">
        <div class="author">
          <div class="author-avatar">${config.authorName.charAt(0)}</div>
          <div>
            <div class="author-name">${config.authorName}</div>
            ${config.authorTitle ? `<div class="author-title">${config.authorTitle}</div>` : ""}
          </div>
        </div>
        ${data.source ? `<div class="source">Source: ${data.source}</div>` : ""}
      </div>
    </body>
    </html>
  `;
}

/**
 * Render infographic to image
 */
export async function renderInfographicToImage(
  data: InfographicData,
  config: InfographicConfig
): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350 });

    const html = generateInfographicHTML(data, config);
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    const imageBuffer = await page.screenshot({ 
      type: "png",
      fullPage: false,
    });

    // Upload to S3
    const fileName = `infographics/${Date.now()}_infographic.png`;
    const result = await storagePut(fileName, imageBuffer, "image/png");
    
    return result.url;
  } finally {
    await browser.close();
  }
}

/**
 * Generate a complete infographic
 */
export async function generateInfographic(
  config: InfographicConfig
): Promise<{ data: InfographicData; imageUrl: string }> {
  // Generate content
  const data = await generateInfographicContent(config.topic, config.type);
  
  // Render to image
  const imageUrl = await renderInfographicToImage(data, config);
  
  return { data, imageUrl };
}
