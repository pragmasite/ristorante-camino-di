/**
 * analyze-images.js
 *
 * Analyzes all images in a directory using OpenAI Vision API.
 * Outputs image-analysis.json with description data for each image.
 *
 * Usage:
 *   node pipeline/analyze-images.js ./assets/
 *
 * Output:
 *   ./assets/image-analysis.json
 *
 * Environment:
 *   OPENAI_API_KEY - Required. Your OpenAI API key.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import OpenAI from 'openai';

// ANSI colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// Delay between images to avoid rate limits
const DELAY_BETWEEN_IMAGES_MS = 500;

// Supported image formats and their MIME types
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

// Analysis prompt - requests plain text, not JSON
const ANALYSIS_PROMPT = `Analyze this image and provide a brief description.

Format your response as follows (plain text, not JSON):
TYPE: [photograph/logo/illustration/business_card/screenshot/diagram/other]
DESCRIPTION: [1-2 sentence description of what the image shows]
SUBJECT: [main subject category: person, product, workspace, landscape, logo, document, etc.]
QUALITY: [excellent/good/fair/poor]
MOOD: [2-4 descriptive keywords]
COLORS: [dominant color palette description]
ALT_TEXT: [accessibility description under 125 characters]`;

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate file hash for caching.
 * @param {string} filePath - Path to file.
 * @returns {string} MD5 hash of file contents.
 */
function getFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Find all image files in a directory.
 * @param {string} dirPath - Directory to search.
 * @returns {string[]} Array of image file paths.
 */
function findImages(dirPath) {
  const images = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (MIME_TYPES[ext]) {
        images.push(path.join(dirPath, entry.name));
      }
    }
  }

  return images.sort();
}

/**
 * Parse plain text response into structured data.
 * @param {string} response - Plain text response from API.
 * @returns {object} Parsed analysis object.
 */
function parseResponse(response) {
  const analysis = {};
  const lines = response.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
    const value = line.slice(colonIndex + 1).trim();

    if (key && value) {
      analysis[key] = value;
    }
  }

  return analysis;
}

/**
 * Analyze a single image using OpenAI's Vision API.
 * @param {string} imagePath - Path to the image file.
 * @param {OpenAI} openai - OpenAI client instance.
 * @returns {Promise<object>} Analysis result.
 */
async function analyzeImage(imagePath, openai) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }],
      max_tokens: 500
    });

    const content = response.choices?.[0]?.message?.content || '';
    const analysis = parseResponse(content);

    // Ensure we have at least alt_text
    if (!analysis.alt_text && analysis.description) {
      analysis.alt_text = analysis.description.slice(0, 125);
    }

    return analysis;
  } catch (err) {
    return { error: err.message || 'Unknown error' };
  }
}

/**
 * Main function to analyze all images in a directory.
 * @param {string} dirPath - Directory containing images.
 */
async function analyzeAllImages(dirPath) {
  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(`${RED}ERROR: OPENAI_API_KEY environment variable not set${RESET}`);
    console.error(`${DIM}Copy .env.example to .env and add your OpenAI API key${RESET}`);
    process.exit(1);
  }

  // Resolve and validate directory
  const resolvedPath = path.resolve(dirPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`${RED}ERROR: Directory not found: ${resolvedPath}${RESET}`);
    process.exit(1);
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    console.error(`${RED}ERROR: Path is not a directory: ${resolvedPath}${RESET}`);
    process.exit(1);
  }

  // Find all images
  const images = findImages(resolvedPath);
  if (images.length === 0) {
    console.error(`${YELLOW}WARNING: No images found in ${resolvedPath}${RESET}`);
    console.error(`${DIM}Supported formats: ${Object.keys(MIME_TYPES).join(', ')}${RESET}`);
    process.exit(0);
  }

  console.log(`${DIM}[analyze-images] Found ${images.length} image(s) in ${resolvedPath}${RESET}`);

  // Load existing analysis for caching
  const outputPath = path.join(resolvedPath, 'image-analysis.json');
  let existingAnalysis = { images: {} };
  if (fs.existsSync(outputPath)) {
    try {
      existingAnalysis = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    } catch {
      // Ignore parse errors, start fresh
    }
  }

  // Create OpenAI client
  const openai = new OpenAI({ apiKey });

  // Analyze each image
  const results = {
    analyzed_at: new Date().toISOString(),
    images: {}
  };

  let skipped = 0;
  let analyzed = 0;

  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    const filename = path.basename(imagePath);
    const fileHash = getFileHash(imagePath);

    // Check cache - skip if file hash matches
    const existing = existingAnalysis.images?.[filename];
    if (existing && existing._hash === fileHash && !existing.error) {
      console.log(`${DIM}[analyze-images] Cached (${i + 1}/${images.length}): ${filename}${RESET}`);
      results.images[filename] = existing;
      skipped++;
      continue;
    }

    console.log(`${DIM}[analyze-images] Analyzing (${i + 1}/${images.length}): ${filename}...${RESET}`);

    const analysis = await analyzeImage(imagePath, openai);

    if (analysis.error) {
      console.error(`${RED}[analyze-images] Error analyzing ${filename}: ${analysis.error}${RESET}`);
      results.images[filename] = { error: analysis.error };
    } else {
      console.log(`${GREEN}[analyze-images] Done: ${filename}${RESET}`);
      results.images[filename] = { ...analysis, _hash: fileHash };
    }

    analyzed++;

    // Add delay between images to avoid rate limits (except for last image)
    if (i < images.length - 1) {
      await sleep(DELAY_BETWEEN_IMAGES_MS);
    }
  }

  // Write output file
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n${GREEN}[analyze-images] Analysis complete!${RESET}`);
  console.log(`${DIM}[analyze-images] Analyzed: ${analyzed}, Cached: ${skipped}${RESET}`);
  console.log(`${DIM}[analyze-images] Output: ${outputPath}${RESET}`);

  return results;
}

// CLI entry point
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  const dirPath = process.argv[2];

  if (!dirPath) {
    console.error(`${RED}Usage: node pipeline/analyze-images.js <directory>${RESET}`);
    console.error(`${DIM}Example: node pipeline/analyze-images.js ./assets/${RESET}`);
    process.exit(1);
  }

  analyzeAllImages(dirPath)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`${RED}[analyze-images] Fatal error: ${err.message}${RESET}`);
      process.exit(1);
    });
}

export default analyzeAllImages;
