#!/usr/bin/env node

/**
 * MMA NEWS ENGINE v7.0 — EXACT Reference Template
 * ══════════════════════════════════════════════════════
 * Layout from user's reference code. Logo from logo.png.
 * Template FIXED — ONLY news text + AI image change daily.
 *
 * EXACT LAYOUT (from reference):
 * 1. White bg, rounded card
 * 2. Top-right: purple dots (8x8 grid, fading)
 * 3. Logo: logo.png + "MAKEMYAPP" tracking text
 * 4. "BREAKING NEWS!" purple-900 + orange-500 italic
 * 5. Decorative line: purple | orange pill | purple
 * 6. Main Card: AI image bg + white gradient overlay
 *    - AI UPDATE badge (purple-900, Cpu icon)
 *    - Company letter-by-letter colorful
 *    - "INTRODUCES" bold gray
 *    - Product: gradient pink + purple-900 + dark
 *    - Tagline two lines
 *    - Instagram handle @makemyapp.co
 * 7. Info Box: gray-50, gradient border purple→orange
 *    - 4 lines with colored bold text
 * 8. Bottom wave: purple + orange SVG
 * 9. Bottom-left: purple dots (6x6 grid)
 *
 * Instagram: 1080x1350 | LinkedIn: 1200x1200
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = __dirname;
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output');
const ARCHIVE_DIR = path.join(OUTPUT_DIR, 'archive');
const LOGO_PATH = path.join(PROJECT_DIR, 'logo.png');

[OUTPUT_DIR, ARCHIVE_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function getDate() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return {
    display: `${d} ${M[now.getMonth()]} ${now.getFullYear()}`,
    file: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${d}`,
  };
}

// ── STEP 1: FETCH NEWS ──
async function fetchRSSNews() {
  console.log('📡 Fetching AI news...');
  let Parser;
  try { Parser = require('rss-parser'); } catch(e) {
    execSync('npm install rss-parser', { cwd: PROJECT_DIR, stdio: 'pipe' });
    Parser = require('rss-parser');
  }
  const parser = new Parser({ timeout: 10000 });
  const feeds = [
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
    { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge AI' },
    { url: 'https://feeds.feedburner.com/venturebeat/SYZF', name: 'VentureBeat AI' },
    { url: 'https://www.artificialintelligence-news.com/feed/', name: 'AI News' },
  ];
  let allItems = [];
  for (const feed of feeds) {
    try {
      const result = await parser.parseURL(feed.url);
      if (result?.items) {
        result.items.forEach(item => {
          allItems.push({ title: item.title||'', snippet: (item.contentSnippet||'').substring(0,300), link: item.link||'', date: item.pubDate||item.isoDate||'', source: feed.name });
        });
        console.log(`  ✅ ${feed.name}: ${result.items.length}`);
      }
    } catch(e) { console.log(`  ⚠️  ${feed.name}: Failed`); }
  }
  allItems.sort((a,b) => new Date(b.date) - new Date(a.date));
  if (allItems.length === 0) return await fetchFromWebSearch();
  return allItems.slice(0, 3);
}

async function fetchFromWebSearch() {
  const f = path.join(OUTPUT_DIR, '_search.json');
  try {
    execSync(`z-ai function -n web_search -a '{"query":"biggest AI news today 2026","num":5,"recency_days":2}' -o ${f}`, { stdio:'pipe' });
    return JSON.parse(fs.readFileSync(f,'utf8')).map(x => ({ title:x.name||'', snippet:x.snippet||'', link:x.url||'', date:x.date||'', source:x.host_name||'Web' }));
  } catch(e) {
    return [{ title:'AI Industry Advances Rapidly', snippet:'Major AI developments continue to reshape technology and business operations worldwide.', link:'', date:new Date().toISOString(), source:'Fallback' }];
  }
}

// ── STEP 2: AI IMAGE ──
async function generateAIImage(news) {
  console.log('🎨 Generating AI image...');
  const imgFile = path.join(OUTPUT_DIR, '_ai_img.png');
  const prompt = `Futuristic AI technology cityscape, neon lights, holographic displays, ${news.company} innovation, deep purple and blue neon, 3D render, cinematic lighting, high quality digital art, wide panoramic view`;
  try {
    execSync(`z-ai-generate -p "${prompt.replace(/"/g,'\\"')}" -o "${imgFile}" -s 1344x768`, { stdio:'pipe', timeout:180000 });
    console.log('  ✅ Image generated');
    return imgFile;
  } catch(e) { console.log('  ⚠️  Image failed:', e.message?.substring(0,100)); return null; }
}

// ── STEP 3: AI REWRITE ──
async function aiRewrite(stories) {
  console.log('✍️  AI rewriting...');
  const top = stories[0];
  const context = stories.slice(0,3).map((s,i) => `${i+1}. ${s.title}: ${s.snippet}`).join('\n');

  const prompt = `You are the LEAD EDITOR at makemyapp AI News — the #1 AI news brand on Instagram.

Take these raw AI news stories and craft ONE powerful post.

SOURCE:
${context}

OUTPUT EXACTLY THIS FORMAT (no markdown, no code blocks, raw text only):

HEADLINE: 4-6 words UPPERCASE. No period. Example: GPT-5 REWRITES THE RULES
COMPANY: Company name UPPERCASE. If none: AI INDUSTRY
PRODUCT_GRADIENT: Main product name part for gradient color. 1-2 words. Example: GEMINI
PRODUCT_PURPLE: Product middle part in purple. Example: 1.5
PRODUCT_DARK: Product suffix in dark. 1-2 words. Example: PRO
TAGLINE_LINE1: First line of tagline. Example: Built for complex tasks.
TAGLINE_LINE2: Second line of tagline. Example: Designed for the future.
SUMMARY_LINE1: First sentence of news. Use [purple]word[/purple] for company/impact, [orange]word[/orange] for product/features. Example: [purple]Google[/purple] has launched [orange]Gemini 1.5 Pro[/orange],
SUMMARY_LINE2: Second sentence with specifics. Same color formatting.
SUMMARY_LINE3: Third sentence. Same formatting.
SUMMARY_LINE4: Fourth sentence. Same formatting.
INSTA_CAPTION: Viral Instagram caption. Hook line in caps. 2 insight lines. CTA. 8 hashtags. 2-3 fire emojis.
LINKEDIN_CAPTION: Professional LinkedIn post. Bold opener. 3-4 sentences business impact. Close with question. 3-5 hashtags.`;

  const promptFile = path.join(OUTPUT_DIR, '_prompt.txt');
  fs.writeFileSync(promptFile, prompt);

  try {
    const aiOut = path.join(OUTPUT_DIR, '_ai_out.txt');
    const helper = path.join(PROJECT_DIR, 'ai-client.mjs');
    fs.writeFileSync(helper, `
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
const pf = process.argv[2], of = process.argv[3];
async function main() {
  try {
    const p = fs.readFileSync(pf,'utf8');
    const zai = await ZAI.create();
    const c = await zai.chat.completions.create({
      messages: [
        { role:'system', content:'You are the lead AI news editor at makemyapp. Follow format EXACTLY. Raw text only. No markdown. No code blocks.' },
        { role:'user', content:p }
      ],
      temperature:0.85, max_tokens:700
    });
    fs.writeFileSync(of, c.choices[0]?.message?.content||'');
    console.log('✅ AI done');
  } catch(e) { console.error('❌',e.message); process.exit(1); }
}
main();`);

    try {
      execSync(`node "${helper}" "${promptFile}" "${aiOut}"`, { stdio:'pipe', timeout:60000 });
      return parseAI(fs.readFileSync(aiOut,'utf8'));
    } catch(e1) {
      try {
        execSync(`cat "${promptFile}" | z-ai chat -o "${aiOut}"`, { stdio:'pipe', timeout:60000 });
        return parseAI(fs.readFileSync(aiOut,'utf8'));
      } catch(e2) { return buildFromRaw(top); }
    }
  } catch(e) { return buildFromRaw(top); }
}

function parseAI(text) {
  const g = (k) => { const m = text.match(new RegExp(k+':\\s*(.+)','i')); return m ? m[1].trim() : ''; };
  return {
    headline: g('HEADLINE') || 'AI BREAKTHROUGH RESHAPES INDUSTRY',
    company: g('COMPANY') || 'AI INDUSTRY',
    productGradient: g('PRODUCT_GRADIENT') || 'NEXT-GEN',
    productPurple: g('PRODUCT_PURPLE') || '',
    productDark: g('PRODUCT_DARK') || 'AI',
    taglineLine1: g('TAGLINE_LINE1') || 'Built for complex tasks.',
    taglineLine2: g('TAGLINE_LINE2') || 'Designed for the future.',
    summaryLine1: g('SUMMARY_LINE1') || '[purple]AI Industry[/purple] has launched [orange]breakthrough technology[/orange],',
    summaryLine2: g('SUMMARY_LINE2') || 'its most [purple]powerful model[/purple] yet.',
    summaryLine3: g('SUMMARY_LINE3') || 'It offers [orange]expanded capabilities[/orange], better reasoning,',
    summaryLine4: g('SUMMARY_LINE4') || 'and [purple]advanced performance[/purple] across tasks.',
    instaCaption: g('INSTA_CAPTION') || '',
    linkedinCaption: g('LINKEDIN_CAPTION') || '',
  };
}

function buildFromRaw(top) {
  const headline = top.title ? top.title.toUpperCase().substring(0,40) : 'AI BREAKTHROUGH RESHAPES INDUSTRY';
  return {
    headline, company:'AI INDUSTRY',
    productGradient:'NEXT-GEN', productPurple:'', productDark:'AI',
    taglineLine1:'Built for complex tasks.', taglineLine2:'Designed for the future.',
    summaryLine1:'[purple]AI Industry[/purple] has announced [orange]major breakthroughs[/orange],',
    summaryLine2:'its most [purple]powerful advancement[/purple] yet.',
    summaryLine3:'It delivers [orange]enhanced capabilities[/orange], better reasoning,',
    summaryLine4:'and [purple]advanced performance[/purple] across tasks.',
    instaCaption:'', linkedinCaption:'',
  };
}

// Convert [color]text[/color] to HTML spans
function colorFormat(text) {
  return text
    .replace(/\[purple\](.*?)\[\/purple\]/g, '<span class="c-purple">$1</span>')
    .replace(/\[orange\](.*?)\[\/orange\]/g, '<span class="c-orange">$1</span>')
    .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="c-blue">$1</span>');
}

// Detect image mime type from file header
function imageMime(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png';
    if (buf[0] === 0xFF && buf[1] === 0xD8) return 'image/jpeg';
    if (buf[0] === 0x47 && buf[1] === 0x49) return 'image/gif';
    if (buf[0] === 0x52 && buf[1] === 0x49) return 'image/webp';
  } catch(e) {}
  return 'image/png';
}

// Build company name HTML — Google gets letter-by-letter colors
function buildCompanyHTML(company) {
  if (company === 'GOOGLE') {
    const colors = ['#4285F4','#EA4335','#FBBC05','#4285F4','#34A853','#EA4335'];
    const letters = 'Google';
    return letters.split('').map((l,i) =>
      `<span style="color:${colors[i]};font-size:${62}px;font-weight:700;">${l}</span>`
    ).join('');
  }
  // Other companies: gradient text
  return `<span class="company-gradient">${company.charAt(0).toUpperCase() + company.slice(1).toLowerCase()}</span>`;
}

// ══ STEP 4: EXACT REFERENCE TEMPLATE HTML ══
function generateHTML(news, date, platform, aiImageFile) {
  const isIG = platform === 'instagram';
  const W = isIG ? 1080 : 1200;
  const H = isIG ? 1350 : 1200;

  // Logo from logo.png as base64
  let logoSrc = '';
  if (fs.existsSync(LOGO_PATH)) {
    const logoMime = imageMime(LOGO_PATH);
    logoSrc = 'data:' + logoMime + ';base64,' + fs.readFileSync(LOGO_PATH).toString('base64');
  }

  // AI image as base64
  let imgSrc = '';
  if (aiImageFile && fs.existsSync(aiImageFile)) {
    const imgMime = imageMime(aiImageFile);
    imgSrc = 'data:' + imgMime + ';base64,' + fs.readFileSync(aiImageFile).toString('base64');
  }

  // Company HTML
  const companyHTML = buildCompanyHTML(news.company);

  // Product name HTML (gradient + purple + dark — matching reference)
  let productLine1 = '';
  if (news.productPurple) {
    productLine1 = `<span class="product-gradient">${news.productGradient}</span><span class="product-purple"> ${news.productPurple}</span>`;
  } else {
    productLine1 = `<span class="product-gradient">${news.productGradient}</span>`;
  }

  // Generate dots SVG for top-right (8x8 grid, fading opacity)
  let dotsTR = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const op = Math.max(0, 1 - (row + col) * 0.08);
      dotsTR += `<circle cx="${8 + col * 14}" cy="${8 + row * 14}" r="3" fill="#6B21A8" opacity="${op.toFixed(2)}"/>`;
    }
  }

  // Generate dots SVG for bottom-left (6x6 grid, reverse fading)
  let dotsBL = '';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const op = Math.max(0, 1 - (5 - row + col) * 0.08);
      dotsBL += `<circle cx="${8 + col * 14}" cy="${8 + row * 14}" r="3" fill="#6B21A8" opacity="${op.toFixed(2)}"/>`;
    }
  }

  // Scale factors for Instagram vs LinkedIn
  const s = isIG ? 1 : 0.9;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BREAKING NEWS - ${date.display}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }

  .card {
    width: ${W}px;
    height: ${H}px;
    background: #FFFFFF;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    border-radius: ${48 * s}px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  /* ══ TOP RIGHT DOTS ══ */
  .dots-topright {
    position: absolute;
    top: 0; right: 0;
    width: ${160 * s}px; height: ${160 * s}px;
    overflow: hidden;
    z-index: 1;
  }

  /* ══ HEADER ══ */
  .header {
    position: relative;
    z-index: 2;
    padding: ${32 * s}px ${40 * s}px ${10 * s}px;
  }

  /* Logo row */
  .logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: ${12 * s}px;
  }
  .logo-row img {
    height: ${44 * s}px;
    width: auto;
  }

  .makemyapp-text {
    font-size: ${11 * s}px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #6B21A8;
    margin-bottom: ${10 * s}px;
  }

  /* ══ BREAKING NEWS TITLE ══ */
  .breaking-title {
    font-size: ${60 * s}px;
    font-weight: 900;
    font-style: italic;
    letter-spacing: -1px;
    line-height: 1;
  }
  .breaking-word { color: #6B21A8; }
  .news-word { color: #F97316; }

  /* Decorative line: purple | orange pill | purple */
  .deco-line {
    display: flex;
    align-items: center;
    gap: ${8 * s}px;
    margin-top: ${10 * s}px;
  }
  .deco-line .purple-line {
    flex: 1;
    height: 2px;
    background: #6B21A8;
  }
  .deco-line .orange-pill {
    width: ${64 * s}px;
    height: 4px;
    background: #F97316;
    border-radius: 999px;
  }

  /* ══ MAIN CARD ══ */
  .main-card {
    position: relative;
    z-index: 2;
    margin: ${18 * s}px ${30 * s}px 0;
    border-radius: ${24 * s}px;
    overflow: hidden;
    min-height: ${460 * s}px;
    flex: 1;
  }

  /* Background image + white gradient overlay */
  .main-card-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .main-card-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .main-card-bg .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(255,255,255,0.92), rgba(255,255,255,0.60), transparent);
  }

  .main-card-content {
    position: relative;
    z-index: 1;
    padding: ${28 * s}px;
  }

  /* AI UPDATE Badge */
  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: ${8 * s}px;
    background: #6B21A8;
    color: #fff;
    padding: ${10 * s}px ${18 * s}px;
    border-radius: ${12 * s}px;
    font-size: ${15 * s}px;
    font-weight: 600;
    margin-bottom: ${18 * s}px;
  }
  .ai-badge svg {
    width: ${18 * s}px;
    height: ${18 * s}px;
  }

  /* Company name */
  .company-gradient {
    font-size: ${32 * s}px;
    font-weight: 700;
    background: linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* INTRODUCES */
  .introduces {
    font-size: ${20 * s}px;
    font-weight: 700;
    color: #111827;
    letter-spacing: 3px;
    margin: ${6 * s}px 0 ${10 * s}px;
    text-transform: uppercase;
  }

  /* Product name */
  .product-gradient {
    font-size: ${54 * s}px;
    font-weight: 900;
    background: linear-gradient(to right, #9333EA, #EC4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .product-purple {
    font-size: ${54 * s}px;
    font-weight: 900;
    color: #6B21A8;
    line-height: 1.1;
  }
  .product-dark {
    font-size: ${54 * s}px;
    font-weight: 900;
    color: #111827;
    line-height: 1.1;
    margin-bottom: ${14 * s}px;
  }

  /* Tagline */
  .tagline {
    font-size: ${15 * s}px;
    font-weight: 500;
    color: #374151;
    line-height: 1.7;
    margin-bottom: ${36 * s}px;
  }

  /* Instagram Handle */
  .insta-handle {
    display: inline-flex;
    align-items: center;
    gap: ${10 * s}px;
    background: rgba(255, 255, 255, 0.80);
    backdrop-filter: blur(8px);
    padding: ${10 * s}px ${18 * s}px;
    border-radius: 999px;
  }
  .insta-handle svg {
    width: ${22 * s}px;
    height: ${22 * s}px;
  }
  .insta-handle-text {
    font-size: ${15 * s}px;
    font-weight: 500;
    color: #1F2937;
  }

  /* ══ INFO BOX ══ */
  .info-box {
    position: relative;
    z-index: 2;
    margin: ${16 * s}px ${30 * s}px ${20 * s}px;
    background: #F9FAFB;
    border-radius: ${20 * s}px;
    padding: ${24 * s}px;
    border: 1px solid #F3F4F6;
  }
  .info-box-inner {
    display: flex;
    gap: ${18 * s}px;
  }
  .info-border {
    width: 4px;
    background: linear-gradient(to bottom, #9333EA, #F97316);
    border-radius: 999px;
    flex-shrink: 0;
  }
  .info-text {
    flex: 1;
  }
  .info-text p {
    font-size: ${18 * s}px;
    font-weight: 600;
    color: #1F2937;
    line-height: 1.6;
    margin-bottom: ${6 * s}px;
  }
  .info-text p:last-child { margin-bottom: 0; }
  .c-purple { color: #7C3AED; font-weight: 700; }
  .c-orange { color: #F97316; font-weight: 700; }

  /* ══ BOTTOM WAVE ══ */
  .bottom-wave {
    position: relative;
    height: ${64 * s}px;
    overflow: hidden;
    z-index: 1;
  }
  .bottom-wave svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  /* ══ BOTTOM LEFT DOTS ══ */
  .dots-bottomleft {
    position: absolute;
    bottom: ${64 * s}px;
    left: 0;
    width: ${96 * s}px;
    height: ${96 * s}px;
    overflow: hidden;
    z-index: 1;
  }
</style>
</head>
<body>
<div class="card">

  <!-- ══ TOP RIGHT DOTS ══ -->
  <div class="dots-topright">
    <svg width="${160 * s}" height="${160 * s}" viewBox="0 0 128 128">${dotsTR}</svg>
  </div>

  <!-- ══ HEADER ══ -->
  <div class="header">
    <!-- Logo from logo.png -->
    <div class="logo-row">
      ${logoSrc
        ? `<img src="${logoSrc}" alt="MAKEMYAPP" />`
        : `<svg width="${80 * s}" height="${32 * s}" viewBox="0 0 80 32"><path d="M0 16 Q5 0 15 16 Q25 32 35 16 Q45 0 55 16 Q65 32 75 16" fill="none" stroke="#6B21A8" stroke-width="4" stroke-linecap="round"/><path d="M55 16 Q60 0 70 16 Q80 32 80 16" fill="none" stroke="#F97316" stroke-width="4" stroke-linecap="round"/></svg>`
      }
    </div>
    <div class="makemyapp-text">MAKEMYAPP</div>

    <!-- Breaking News Title -->
    <div class="breaking-title">
      <span class="breaking-word">BREAKING</span> <span class="news-word">NEWS!</span>
    </div>
    <div class="deco-line">
      <div class="purple-line"></div>
      <div class="orange-pill"></div>
      <div class="purple-line"></div>
    </div>
  </div>

  <!-- ══ MAIN CARD ══ -->
  <div class="main-card">
    <!-- Background Image + Overlay -->
    <div class="main-card-bg">
      ${imgSrc
        ? `<img src="${imgSrc}" alt="Futuristic city" /><div class="overlay"></div>`
        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a0533 0%,#2d1b69 40%,#1e3a8a 70%,#0f2847 100%);"></div><div class="overlay" style="background:linear-gradient(to right,rgba(255,255,255,0.92),rgba(255,255,255,0.60),transparent);"></div>`
      }
    </div>

    <div class="main-card-content">
      <!-- AI UPDATE Badge with Cpu icon -->
      <div class="ai-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>
        </svg>
        AI UPDATE
      </div>

      <!-- Company Name -->
      <div style="margin-bottom:4px;">${companyHTML}</div>

      <!-- INTRODUCES -->
      <div class="introduces">INTRODUCES</div>

      <!-- Product Name -->
      <div>${productLine1}</div>
      <div class="product-dark">${news.productDark}</div>

      <!-- Tagline -->
      <p class="tagline">${news.taglineLine1}<br/>${news.taglineLine2}</p>

      <!-- Instagram Handle -->
      <div class="insta-handle">
        <svg viewBox="0 0 24 24" fill="none" stroke="#DB2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
        <span class="insta-handle-text">Instagram: @makemyapp.co</span>
      </div>
    </div>
  </div>

  <!-- ══ INFO BOX ══ -->
  <div class="info-box">
    <div class="info-box-inner">
      <div class="info-border"></div>
      <div class="info-text">
        <p>${colorFormat(news.summaryLine1)}</p>
        <p>${colorFormat(news.summaryLine2)}</p>
        <p>${colorFormat(news.summaryLine3)}</p>
        <p>${colorFormat(news.summaryLine4)}</p>
      </div>
    </div>
  </div>

  <!-- ══ BOTTOM LEFT DOTS ══ -->
  <div class="dots-bottomleft">
    <svg width="${96 * s}" height="${96 * s}" viewBox="0 0 96 96">${dotsBL}</svg>
  </div>

  <!-- ══ BOTTOM WAVE ══ -->
  <div class="bottom-wave">
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" style="height:${64 * s}px;">
      <path d="M0 60 L0 30 Q100 0 200 20 Q300 40 400 10 L400 60 Z" fill="#7C3AED"/>
      <path d="M200 60 L200 35 Q300 20 400 25 L400 60 Z" fill="#F97316"/>
    </svg>
  </div>

</div>
</body>
</html>`;

  return html;
}

// ── STEP 5: RENDER PNG ──
async function renderPNGs(igHTML, liHTML, outDir) {
  console.log('🖼️  Rendering PNGs...');
  let chromium;
  try { const pw = require('playwright'); chromium = pw.chromium; } catch(e) {
    execSync('npm install playwright', { cwd: PROJECT_DIR, stdio:'pipe' });
    const pw = require('playwright'); chromium = pw.chromium;
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Instagram
  const igFile = path.resolve(path.join(outDir, 'instagram_1080x1350.html'));
  fs.writeFileSync(igFile, igHTML);
  await page.setViewportSize({width:1080, height:1350});
  await page.goto('file://' + igFile);
  await page.waitForTimeout(2500);
  await page.screenshot({path:path.join(outDir, 'instagram_1080x1350.png'), fullPage:false});
  console.log('  ✅ Instagram 1080x1350');

  // LinkedIn
  const liFile = path.resolve(path.join(outDir, 'linkedin_1200x1200.html'));
  fs.writeFileSync(liFile, liHTML);
  await page.setViewportSize({width:1200, height:1200});
  await page.goto('file://' + liFile);
  await page.waitForTimeout(2500);
  await page.screenshot({path:path.join(outDir, 'linkedin_1200x1200.png'), fullPage:false});
  console.log('  ✅ LinkedIn 1200x1200');

  await browser.close();
}

// ── STEP 6: CAPTIONS ──
function saveCaptions(news, date, outDir) {
  console.log('📝 Saving captions...');
  const insta = news.instaCaption || `${news.headline}

🔥 This changes EVERYTHING.

💡 ${news.company} just dropped ${news.productGradient} ${news.productPurple} ${news.productDark} and it's a game-changer for the industry.

📌 Save this. Stay ahead of the curve.

Follow @makemyapp.co for daily AI updates!

#AI #ArtificialIntelligence #TechNews #Innovation #FutureOfWork #AITrends #MachineLearning #makemyapp`;

  const linkedin = news.linkedinCaption || `${news.headline}

${news.company} has introduced ${news.productGradient} ${news.productPurple} ${news.productDark}, marking a significant advancement in AI capabilities. This development offers enhanced performance and expanded potential for enterprise applications.

The implications for business strategy are substantial — early adopters will gain a decisive competitive edge in their respective markets.

What does this mean for your industry? Share your thoughts below.

#ArtificialIntelligence #TechInnovation #BusinessStrategy #AITrends #FutureOfWork`;

  fs.writeFileSync(path.join(outDir, 'instagram_caption.txt'), insta + `\n\n---\nMMA News Engine | ${date.display}\n@makemyapp.co`, 'utf8');
  fs.writeFileSync(path.join(outDir, 'linkedin_caption.txt'), linkedin + `\n\n---\nMMA News Engine | ${date.display}\nmakemyapp.co`, 'utf8');
  console.log('  ✅ Captions saved');
}

// ── STEP 7: ZIP ──
function createZip(dir, zipName) {
  const zipPath = path.join(ARCHIVE_DIR, zipName);
  execSync(`cd "${dir}" && zip -r "${zipPath}" .`, { stdio:'pipe' });
  return zipPath;
}

// ══ MAIN ══
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   MMA NEWS ENGINE v7.0               ║');
  console.log('║   EXACT Reference Template            ║');
  console.log('║   logo.png + AI Images + Wave         ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');

  const date = getDate();
  console.log(`📅 ${date.display}`);

  const stories = await fetchRSSNews();
  const news = await aiRewrite(stories);
  console.log(`📰 ${news.headline} | ${news.company} | ${news.productGradient} ${news.productPurple} ${news.productDark}`);

  const aiImageFile = await generateAIImage(news);

  console.log('🔧 Generating HTML...');
  const igHTML = generateHTML(news, date, 'instagram', aiImageFile);
  const liHTML = generateHTML(news, date, 'linkedin', aiImageFile);

  const todayDir = path.join(OUTPUT_DIR, `news_${date.file}`);
  if (!fs.existsSync(todayDir)) fs.mkdirSync(todayDir, { recursive: true });

  await renderPNGs(igHTML, liHTML, todayDir);
  saveCaptions(news, date, todayDir);

  const zipPath = createZip(todayDir, `ai_news_${date.file}.zip`);
  console.log(`📦 ZIP: ${zipPath}`);

  const latestDir = path.join(OUTPUT_DIR, 'latest');
  if (fs.existsSync(latestDir)) execSync(`rm -rf "${latestDir}"`, {stdio:'pipe'});
  execSync(`cp -r "${todayDir}" "${latestDir}"`, {stdio:'pipe'});

  console.log('');
  console.log('✅ DONE!');
  console.log(`   📁 ${todayDir}`);
  console.log('');
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
