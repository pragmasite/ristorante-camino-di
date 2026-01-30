/**
 * generate-favicon.js
 *
 * Pre-build pipeline step that generates favicon files from a source image
 * (typically the logo) or creates a simple text-based favicon from the site name.
 *
 * Usage (programmatic):
 *   import generateFavicon from './pipeline/generate-favicon.js';
 *   const result = await generateFavicon('site-config.json');
 *
 * Usage (CLI):
 *   node pipeline/generate-favicon.js <config-path>
 *
 * This script requires a canvas library for image manipulation.
 * If not available, it will skip favicon generation with a warning.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Check if a file exists
 * @param {string} filePath
 * @returns {boolean}
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Generate a simple SVG favicon from text (first letter of site name)
 * @param {string} text - The text to display (typically first letter)
 * @param {string} bgColor - Background color in HSL format (e.g., "45 80% 52%")
 * @param {string} fgColor - Foreground color in HSL format
 * @returns {string} SVG content
 */
function generateTextSvgFavicon(text, bgColor = "220 20% 15%", fgColor = "0 0% 100%") {
  const letter = text.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="hsl(${bgColor})" rx="4"/>
  <text x="16" y="23" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="hsl(${fgColor})" text-anchor="middle">${letter}</text>
</svg>`;
}

/**
 * Generate favicon files for a SiteForge config.
 * Currently generates an SVG favicon from the site name if no favicon is specified.
 *
 * @param {string} configPath - Path to the site-config.json file.
 * @returns {Promise<{generated: boolean, favicon?: string, error?: string}>}
 */
export default async function generateFavicon(configPath) {
  const resolvedConfigPath = path.resolve(configPath);
  const configDir = path.dirname(resolvedConfigPath);

  // Read and parse config
  let configText;
  try {
    configText = fs.readFileSync(resolvedConfigPath, 'utf-8');
  } catch (err) {
    return { generated: false, error: `Failed to read config file: ${err.message}` };
  }

  let config;
  try {
    config = JSON.parse(configText);
  } catch (err) {
    return { generated: false, error: `Failed to parse config JSON: ${err.message}` };
  }

  // Check if favicon already exists
  if (config.seo?.favicon && fileExists(path.join(configDir, config.seo.favicon))) {
    console.log('[generate-favicon] Favicon already configured. Skipping generation.');
    return { generated: false };
  }

  // Check if we should generate a favicon
  const siteName = config.name || 'Site';
  const publicDir = path.join(configDir, 'public');

  // Ensure public directory exists
  fs.mkdirSync(publicDir, { recursive: true });

  // Get theme colors for the favicon
  const bgColor = config.theme?.colors?.primary || "220 20% 15%";
  const fgColor = config.theme?.colors?.["primary-foreground"] || "0 0% 100%";

  // Generate SVG favicon
  const svgContent = generateTextSvgFavicon(siteName, bgColor, fgColor);
  const faviconPath = path.join(publicDir, 'favicon.svg');

  try {
    fs.writeFileSync(faviconPath, svgContent, 'utf-8');
    console.log(`[generate-favicon] Generated SVG favicon at ${faviconPath}`);

    // Update config with favicon path
    if (!config.seo) {
      config.seo = {};
    }
    config.seo.favicon = '/favicon.svg';

    // Write updated config
    const updatedText = JSON.stringify(config, null, 2) + '\n';
    fs.writeFileSync(resolvedConfigPath, updatedText, 'utf-8');
    console.log('[generate-favicon] Updated config with favicon path.');

    return { generated: true, favicon: '/favicon.svg' };
  } catch (err) {
    return { generated: false, error: `Failed to generate favicon: ${err.message}` };
  }
}

// CLI entry point
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  const configPath = process.argv[2];

  if (!configPath) {
    console.error('Usage: node pipeline/generate-favicon.js <config-path>');
    process.exit(1);
  }

  generateFavicon(configPath)
    .then((result) => {
      if (result.error) {
        console.error(`[generate-favicon] Error: ${result.error}`);
        process.exit(1);
      }
      if (result.generated) {
        console.log('[generate-favicon] Favicon generation complete.');
      }
    })
    .catch((err) => {
      console.error(`[generate-favicon] Fatal error: ${err.message}`);
      process.exit(1);
    });
}
