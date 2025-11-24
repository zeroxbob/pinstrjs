import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// Read the SVG file
const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'));

// Generate different sizes
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

console.log('Generating favicon files...');

// Generate PNG files
for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name));
  console.log(`✓ Generated ${name}`);
}

// Generate ICO file (32x32 and 16x16)
const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();

// Note: ICO generation is complex, so we'll just use the 32x32 PNG as favicon.ico
// For production, you'd want a proper ICO with multiple sizes embedded
writeFileSync(join(publicDir, 'favicon.ico'), ico32);
console.log('✓ Generated favicon.ico');

console.log('\nAll favicon files generated successfully!');
