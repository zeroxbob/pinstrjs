/**
 * Generate extension icons from the main app's favicon.
 * Run with: node extension/scripts/generate-icons.js
 */

import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionDir = join(__dirname, "..");
const iconsDir = join(extensionDir, "icons");

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

// Create a simple bookmark icon (violet/indigo gradient background with white bookmark)
async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <path
        d="M${size * 0.3} ${size * 0.15}
           h${size * 0.4}
           v${size * 0.55}
           l-${size * 0.2} -${size * 0.12}
           l-${size * 0.2} ${size * 0.12}
           z"
        fill="white"
      />
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(iconsDir, `icon${size}.png`));

  console.log(`Generated icon${size}.png`);
}

async function main() {
  for (const size of sizes) {
    await generateIcon(size);
  }
  console.log("All icons generated!");
}

main().catch(console.error);
