import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionDir = join(__dirname, "..");
const distDir = join(extensionDir, "dist");

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
copyFileSync(
  join(extensionDir, "manifest.json"),
  join(distDir, "manifest.json")
);

// Create icons directory
const iconsDir = join(distDir, "icons");
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Copy icons if they exist
const iconSizes = [16, 32, 48, 128];
for (const size of iconSizes) {
  const iconPath = join(extensionDir, "icons", `icon${size}.png`);
  if (existsSync(iconPath)) {
    copyFileSync(iconPath, join(iconsDir, `icon${size}.png`));
  }
}

console.log("Static files copied to dist/");
