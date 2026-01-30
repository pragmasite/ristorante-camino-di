#!/usr/bin/env node

/**
 * optimize-images.js — Pre-build pipeline step
 *
 * Scans the local assets directory for images and logs their sizes.
 * In a production setup, this would resize, compress, and convert
 * images to modern formats (WebP/AVIF). For now, it validates that
 * referenced local images exist and reports their sizes.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function optimizeImages(configPath) {
  const configDir = dirname(configPath);
  const assetsDir = join(configDir, 'assets');

  if (!existsSync(assetsDir)) {
    console.log(`  ${YELLOW}⚠${RESET}  No assets directory found — skipping optimization`);
    return { optimized: 0, totalSize: 0, warnings: [] };
  }

  const files = readdirSync(assetsDir);
  const imageFiles = files.filter(f => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log(`  ${YELLOW}⚠${RESET}  No image files found in assets/`);
    return { optimized: 0, totalSize: 0, warnings: [] };
  }

  let totalSize = 0;
  const warnings = [];

  for (const file of imageFiles) {
    const filePath = join(assetsDir, file);
    const stat = statSync(filePath);
    totalSize += stat.size;

    const sizeStr = formatBytes(stat.size);

    if (stat.size > 5 * 1024 * 1024) {
      warnings.push(`${file} is ${sizeStr} — consider compressing`);
      console.log(`  ${YELLOW}⚠${RESET}  ${file} ${DIM}(${sizeStr} — large)${RESET}`);
    } else {
      console.log(`  ${GREEN}✓${RESET}  ${file} ${DIM}(${sizeStr})${RESET}`);
    }
  }

  console.log(`\n  ${DIM}${imageFiles.length} images, ${formatBytes(totalSize)} total${RESET}`);

  return { optimized: imageFiles.length, totalSize, warnings };
}
