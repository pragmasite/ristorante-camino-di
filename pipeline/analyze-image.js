/**
 * analyze-image.js
 *
 * CLI tool to analyze images using OpenAI's Vision API.
 * Useful for evaluating logos, hero images, and other visual assets.
 *
 * Usage (programmatic):
 *   import analyzeImage from './pipeline/analyze-image.js';
 *   const result = await analyzeImage('./assets/logo.png', 'Is this logo suitable for a header?');
 *
 * Usage (CLI):
 *   node pipeline/analyze-image.js <image-path> "<question>"
 *
 * Environment:
 *   OPENAI_API_KEY - Required. Your OpenAI API key.
 */

import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

// ANSI colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// Supported image formats and their MIME types
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

/**
 * Analyze an image using OpenAI's Vision API.
 *
 * @param {string} imagePath - Path to local image file.
 * @param {string} question - Question to ask about the image.
 * @returns {Promise<{success: boolean, response?: string, error?: string}>}
 */
export default async function analyzeImage(imagePath, question) {
  // 1. Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'OPENAI_API_KEY environment variable not set' };
  }

  // 2. Resolve and validate image path
  const resolvedPath = path.resolve(imagePath);
  if (!fs.existsSync(resolvedPath)) {
    return { success: false, error: `Image file not found: ${resolvedPath}` };
  }

  // 3. Check file extension
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    return {
      success: false,
      error: `Unsupported image format: ${ext}. Supported: ${Object.keys(MIME_TYPES).join(', ')}`
    };
  }

  // 4. Read and encode image as base64
  const imageBuffer = fs.readFileSync(resolvedPath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  // 5. Create OpenAI client and make request
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: question },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }],
      max_tokens: 500
    });

    const content = response.choices?.[0]?.message?.content || 'No response';
    return { success: true, response: content };
  } catch (err) {
    // Handle OpenAI SDK errors
    const errorMessage = err.message || 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// CLI entry point
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  const imagePath = process.argv[2];
  const question = process.argv[3];

  if (!imagePath || !question) {
    console.error(`${RED}Usage: node pipeline/analyze-image.js <image-path> "<question>"${RESET}`);
    console.error(`${DIM}Example: node pipeline/analyze-image.js ./assets/logo.png "Is this logo suitable for a header?"${RESET}`);
    process.exit(1);
  }

  console.log(`${DIM}[analyze-image] Analyzing: ${imagePath}${RESET}`);
  console.log(`${DIM}[analyze-image] Question: ${question}${RESET}`);

  analyzeImage(imagePath, question)
    .then((result) => {
      if (result.success) {
        console.log(`\n${GREEN}[analyze-image] Response:${RESET}\n`);
        console.log(result.response);
        process.exit(0);
      } else {
        console.error(`\n${RED}[analyze-image] Error: ${result.error}${RESET}`);
        process.exit(1);
      }
    });
}
