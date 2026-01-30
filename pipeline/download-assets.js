/**
 * download-assets.js
 *
 * Pre-build pipeline step that downloads remote images referenced in a
 * SiteForge JSON config file to a local assets directory. Remote URLs in the
 * config are replaced with their local paths so the Vite build can bundle
 * them directly.
 *
 * Usage (programmatic):
 *   import downloadAssets from './pipeline/download-assets.js';
 *   const result = await downloadAssets('site-config.json', 'assets');
 *
 * Usage (CLI):
 *   node pipeline/download-assets.js <config-path> [output-dir]
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

const MAX_REDIRECTS = 5;

/**
 * Sanitize a URL's last path segment into a safe local filename.
 * Strips query strings and fragments, replaces unsafe characters,
 * and ensures the result is non-empty.
 *
 * @param {string} urlString - The remote URL.
 * @returns {string} A sanitized filename.
 */
function localFilenameFromUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    // Fallback: hash the whole string
    return 'asset_' + simpleHash(urlString);
  }

  // Take the last path segment (without query/fragment)
  const segments = parsed.pathname.split('/').filter(Boolean);
  let filename = segments.length > 0 ? segments[segments.length - 1] : '';

  // Decode percent-encoded characters
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // keep as-is if decoding fails
  }

  // Replace characters that are problematic in filenames
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Remove leading dots (hidden files)
  filename = filename.replace(/^\.+/, '');

  // Ensure non-empty
  if (!filename) {
    filename = 'asset_' + simpleHash(urlString);
  }

  return filename;
}

/**
 * Simple non-crypto hash to create short unique-ish identifiers.
 * @param {string} str
 * @returns {string}
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Download a file from a URL, following redirects up to `maxRedirects` times.
 *
 * @param {string} urlString - The URL to download.
 * @param {string} destPath  - The local file path to write to.
 * @param {number} [maxRedirects=5] - Maximum number of redirects to follow.
 * @returns {Promise<void>}
 */
function downloadFile(urlString, destPath, maxRedirects = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const doRequest = (url, redirectsLeft) => {
      let parsed;
      try {
        parsed = new URL(url);
      } catch (err) {
        return reject(new Error(`Invalid URL: ${url}`));
      }

      const transport = parsed.protocol === 'https:' ? https : http;

      const req = transport.get(url, (res) => {
        const { statusCode, headers } = res;

        // Handle redirects (301, 302, 303, 307, 308)
        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          // Consume the response body to free up memory
          res.resume();

          if (redirectsLeft <= 0) {
            return reject(new Error(
              `Too many redirects (>${MAX_REDIRECTS}) for URL: ${urlString}`
            ));
          }

          // Resolve relative redirect URLs against the current URL
          const redirectUrl = new URL(headers.location, url).href;
          return doRequest(redirectUrl, redirectsLeft - 1);
        }

        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          return reject(new Error(
            `HTTP ${statusCode} when downloading ${urlString}`
          ));
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(resolve);
        });

        fileStream.on('error', (err) => {
          // Clean up partial file on error
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      // Set a reasonable timeout (30 seconds)
      req.setTimeout(30_000, () => {
        req.destroy();
        reject(new Error(`Timeout downloading ${urlString}`));
      });
    };

    doRequest(urlString, maxRedirects);
  });
}

/**
 * Check whether a string looks like a remote URL we should download.
 * @param {string} value
 * @returns {boolean}
 */
function isRemoteUrl(value) {
  return typeof value === 'string' &&
    (value.startsWith('http://') || value.startsWith('https://'));
}

/**
 * Recursively walk a JSON-compatible object and collect every string value
 * that is a remote URL, along with a setter so we can update it in place.
 *
 * @param {*} obj - The object to walk.
 * @param {Array<{url: string, set: (newValue: string) => void}>} results - Accumulator.
 * @returns {Array<{url: string, set: (newValue: string) => void}>}
 */
function collectRemoteUrls(obj, results = []) {
  if (obj === null || obj === undefined) {
    return results;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const val = obj[i];
      if (isRemoteUrl(val)) {
        const index = i;
        const arr = obj;
        results.push({
          url: val,
          set: (newValue) => { arr[index] = newValue; }
        });
      } else if (typeof val === 'object' && val !== null) {
        collectRemoteUrls(val, results);
      }
    }
  } else if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (isRemoteUrl(val)) {
        const k = key;
        const parent = obj;
        results.push({
          url: val,
          set: (newValue) => { parent[k] = newValue; }
        });
      } else if (typeof val === 'object' && val !== null) {
        collectRemoteUrls(val, results);
      }
    }
  }

  return results;
}

/**
 * Deduplicate URLs: when multiple config fields point to the same remote URL,
 * download it once and update all references.
 *
 * @param {Array<{url: string, set: (v: string) => void}>} entries
 * @returns {Map<string, Array<(v: string) => void>>} url -> list of setters
 */
function deduplicateByUrl(entries) {
  const map = new Map();
  for (const { url, set } of entries) {
    if (!map.has(url)) {
      map.set(url, []);
    }
    map.get(url).push(set);
  }
  return map;
}

/**
 * Ensure a filename is unique within the target directory by appending a
 * numeric suffix if necessary: image.jpg -> image_2.jpg -> image_3.jpg
 *
 * @param {string} dir      - The directory to check in.
 * @param {string} filename - The desired filename.
 * @param {Set<string>} reserved - Already-claimed filenames in this run.
 * @returns {string} A unique filename.
 */
function uniqueFilename(dir, filename, reserved) {
  if (!fs.existsSync(path.join(dir, filename)) && !reserved.has(filename)) {
    return filename;
  }

  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let counter = 2;

  while (true) {
    const candidate = `${base}_${counter}${ext}`;
    if (!fs.existsSync(path.join(dir, candidate)) && !reserved.has(candidate)) {
      return candidate;
    }
    counter++;
  }
}

/**
 * Download all remote assets referenced in a SiteForge JSON config,
 * save them locally, and rewrite the config to use local paths.
 *
 * @param {string} configPath - Path to the site-config.json file.
 * @param {string} [outputDir] - Directory to save assets to. Defaults to
 *   "assets/" relative to the config file's parent directory.
 * @returns {Promise<{downloaded: number, skipped: number, errors: string[]}>}
 */
export default async function downloadAssets(configPath, outputDir) {
  const resolvedConfigPath = path.resolve(configPath);

  // Default output dir: assets/ next to the config file
  const configDir = path.dirname(resolvedConfigPath);
  const resolvedOutputDir = outputDir
    ? path.resolve(outputDir)
    : path.join(configDir, 'assets');

  // Compute the relative path from config dir to output dir for rewriting
  const relativeAssetsDir = path.relative(configDir, resolvedOutputDir);

  // Read and parse config
  let configText;
  try {
    configText = fs.readFileSync(resolvedConfigPath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read config file at ${resolvedConfigPath}: ${err.message}`);
  }

  let config;
  try {
    config = JSON.parse(configText);
  } catch (err) {
    throw new Error(`Failed to parse config JSON: ${err.message}`);
  }

  // Collect all remote URLs from the config
  const entries = collectRemoteUrls(config);

  if (entries.length === 0) {
    console.log('[download-assets] No remote URLs found in config. Nothing to do.');
    return { downloaded: 0, skipped: 0, errors: [] };
  }

  console.log(`[download-assets] Found ${entries.length} remote URL reference(s) in config.`);

  // Deduplicate: same URL may appear in multiple places
  const urlMap = deduplicateByUrl(entries);
  console.log(`[download-assets] ${urlMap.size} unique URL(s) to process.`);

  // Ensure assets directory exists
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  const stats = { downloaded: 0, skipped: 0, errors: [] };
  const reservedFilenames = new Set();

  for (const [url, setters] of urlMap) {
    let rawFilename = localFilenameFromUrl(url);
    let filename = uniqueFilename(resolvedOutputDir, rawFilename, reservedFilenames);
    reservedFilenames.add(filename);

    const destPath = path.join(resolvedOutputDir, filename);
    const localRef = path.join(relativeAssetsDir, filename).replace(/\\/g, '/');

    // Check if already downloaded (idempotent)
    // We also check if the raw filename (without uniqueness suffix) exists,
    // because on repeat runs the file from a previous download is already there.
    const rawDestPath = path.join(resolvedOutputDir, rawFilename);
    if (fs.existsSync(rawDestPath)) {
      const existingLocalRef = path.join(relativeAssetsDir, rawFilename).replace(/\\/g, '/');
      console.log(`[download-assets] SKIP (cached): ${url} -> ${existingLocalRef}`);
      for (const set of setters) {
        set(existingLocalRef);
      }
      stats.skipped++;
      continue;
    }

    // Download
    try {
      console.log(`[download-assets] Downloading: ${url}`);
      await downloadFile(url, destPath);
      console.log(`[download-assets] SAVED: ${url} -> ${localRef}`);

      for (const set of setters) {
        set(localRef);
      }
      stats.downloaded++;
    } catch (err) {
      const msg = `Failed to download ${url}: ${err.message}`;
      console.error(`[download-assets] ERROR: ${msg}`);
      stats.errors.push(msg);
    }
  }

  // Write updated config back
  try {
    const updatedText = JSON.stringify(config, null, 2) + '\n';
    fs.writeFileSync(resolvedConfigPath, updatedText, 'utf-8');
    console.log(`[download-assets] Updated config written to ${resolvedConfigPath}`);
  } catch (err) {
    const msg = `Failed to write updated config: ${err.message}`;
    console.error(`[download-assets] ERROR: ${msg}`);
    stats.errors.push(msg);
  }

  console.log(
    `[download-assets] Done. Downloaded: ${stats.downloaded}, ` +
    `Skipped: ${stats.skipped}, Errors: ${stats.errors.length}`
  );

  return stats;
}

// ─── CLI entry point ────────────────────────────────────────────────────────
// Allows running directly: node pipeline/download-assets.js <config> [output-dir]
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  const configPath = process.argv[2];
  const outputDir = process.argv[3] || undefined;

  if (!configPath) {
    console.error('Usage: node pipeline/download-assets.js <config-path> [output-dir]');
    process.exit(1);
  }

  downloadAssets(configPath, outputDir)
    .then((result) => {
      if (result.errors.length > 0) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(`[download-assets] Fatal error: ${err.message}`);
      process.exit(1);
    });
}
