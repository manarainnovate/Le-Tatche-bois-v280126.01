import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'images');
const iconsDir = join(__dirname, '..', 'public', 'icons');
const screenshotsDir = join(__dirname, '..', 'public', 'screenshots');

// Wood-themed colors
const COLORS = {
  primary: '#D4A574',    // Light wood
  secondary: '#8B5A2B',  // Medium wood
  dark: '#5D3A1A',       // Dark wood
  accent: '#B8860B',     // Golden wood
};

async function createPlaceholder(width, height, _text, outputPath) {
  // Create SVG with wood-themed placeholder - NO TEXT, just colors and subtle patterns
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.dark};stop-opacity:1" />
        </linearGradient>
        <pattern id="woodPattern" patternUnits="userSpaceOnUse" width="100" height="20">
          <rect width="100" height="20" fill="transparent"/>
          <line x1="0" y1="10" x2="100" y2="10" stroke="${COLORS.dark}" stroke-opacity="0.08" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#woodGrad)"/>
      <rect width="100%" height="100%" fill="url(#woodPattern)"/>
      <rect x="0" y="0" width="100%" height="100%" fill="${COLORS.accent}" fill-opacity="0.05"/>
    </svg>
  `;

  await mkdir(dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function createLogoPlaceholder(size, text, outputPath, isLight = false) {
  const bgColor = isLight ? COLORS.primary : COLORS.dark;
  const textColor = isLight ? COLORS.dark : COLORS.primary;

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="55%" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="${size * 0.15}" fill="${textColor}">LTB</text>
    </svg>
  `;

  await mkdir(dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function createPWAIcon(size, outputPath) {
  // PWA icons with wood theme - "LTB" text centered
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pwaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.dark};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#pwaGrad)" rx="${size * 0.1}"/>
      <text x="50%" y="58%" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="${size * 0.25}" fill="${COLORS.primary}">LTB</text>
    </svg>
  `;

  await mkdir(dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function createShortcutIcon(size, iconType, outputPath) {
  // Shortcut icons with different symbols
  const icons = {
    shop: '🛒',
    quote: '📝',
    contact: '📞',
  };

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.secondary}" rx="${size * 0.15}"/>
      <text x="50%" y="65%" text-anchor="middle" font-size="${size * 0.5}">${icons[iconType] || '🪵'}</text>
    </svg>
  `;

  await mkdir(dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

async function main() {
  console.log('Generating placeholder images...\n');

  // Main placeholder
  await createPlaceholder(800, 600, 'Placeholder', join(publicDir, 'placeholder.jpg'));

  // Logo images
  await createLogoPlaceholder(200, 'Logo', join(publicDir, 'logo.png'), false);
  await createLogoPlaceholder(200, 'Logo', join(publicDir, 'logo-light.png'), true);

  // Hero slides
  for (let i = 1; i <= 3; i++) {
    await createPlaceholder(1920, 1080, `Hero ${i}`, join(publicDir, 'hero', `slide-${i}.jpg`));
  }

  // About images
  await createPlaceholder(800, 600, 'Workshop', join(publicDir, 'about', 'workshop.jpg'));
  await createPlaceholder(1200, 800, 'Workshop Hero', join(publicDir, 'about', 'workshop-hero.jpg'));
  await createPlaceholder(600, 800, 'Founder', join(publicDir, 'about', 'founder.jpg'));
  await createPlaceholder(1200, 600, 'CTA Background', join(publicDir, 'about', 'cta-bg.jpg'));

  // Project images
  for (let i = 1; i <= 6; i++) {
    await createPlaceholder(800, 600, `Project ${i}`, join(publicDir, 'projects', `project-${i}.jpg`));
  }

  // Product images
  for (let i = 1; i <= 6; i++) {
    await createPlaceholder(600, 600, `Product ${i}`, join(publicDir, 'products', `product-${i}.jpg`));
  }

  // Testimonial/client images
  for (let i = 1; i <= 4; i++) {
    await createPlaceholder(200, 200, `Client ${i}`, join(publicDir, 'testimonials', `client-${i}.jpg`));
  }

  // Team images
  await createPlaceholder(400, 500, 'Founder', join(publicDir, 'team', 'founder.jpg'));
  await createPlaceholder(400, 500, 'Chef', join(publicDir, 'team', 'chef.jpg'));
  await createPlaceholder(400, 500, 'Designer', join(publicDir, 'team', 'designer.jpg'));
  await createPlaceholder(400, 500, 'Artisan', join(publicDir, 'team', 'artisan.jpg'));

  // Workshop gallery images
  for (let i = 1; i <= 6; i++) {
    await createPlaceholder(800, 600, `Workshop ${i}`, join(publicDir, 'workshop', `workshop-${i}.jpg`));
  }

  // CTA background
  await createPlaceholder(1920, 800, 'Workshop BG', join(publicDir, 'cta', 'workshop-bg.jpg'));

  // Admin media demo images
  await createPlaceholder(1920, 1080, 'Hero BG', join(publicDir, 'hero-bg.jpg'));
  await createPlaceholder(800, 600, 'About Workshop', join(publicDir, 'about-workshop.jpg'));
  await createPlaceholder(600, 600, 'Product Table', join(publicDir, 'product-table.jpg'));

  // PWA Icons
  console.log('\nGenerating PWA icons...');
  const iconSizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
  for (const size of iconSizes) {
    await createPWAIcon(size, join(iconsDir, `icon-${size}x${size}.png`));
  }

  // Apple touch icon (180x180)
  await createPWAIcon(180, join(iconsDir, 'apple-touch-icon.png'));

  // Shortcut icons for PWA
  await createShortcutIcon(96, 'shop', join(iconsDir, 'shop-icon.png'));
  await createShortcutIcon(96, 'quote', join(iconsDir, 'quote-icon.png'));
  await createShortcutIcon(96, 'contact', join(iconsDir, 'contact-icon.png'));

  // PWA Screenshots
  console.log('\nGenerating PWA screenshots...');
  await createPlaceholder(1920, 1080, 'Desktop Screenshot', join(screenshotsDir, 'desktop.jpg'));
  await createPlaceholder(750, 1334, 'Mobile Screenshot', join(screenshotsDir, 'mobile.jpg'));

  console.log('\nAll placeholder images generated successfully!');
}

main().catch(console.error);
