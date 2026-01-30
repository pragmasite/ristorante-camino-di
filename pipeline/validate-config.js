/**
 * validate-config.js
 *
 * Pre-build pipeline step that validates a SiteForge JSON configuration file
 * using Zod schemas. Reports errors and warnings with colored output.
 *
 * Usage (programmatic):
 *   import validateConfig from './pipeline/validate-config.js';
 *   const result = await validateConfig('site-config.json');
 *
 * Usage (CLI):
 *   node pipeline/validate-config.js <config-path>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSiteConfig } from './schemas.js';

// ANSI color helpers
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

function pass(message) {
  console.log(green(`  ✓ ${message}`));
}

function fail(message) {
  console.log(red(`  ✗ ${message}`));
}

function warn(message) {
  console.log(yellow(`  ⚠ ${message}`));
}

/**
 * Validates a SiteForge JSON configuration file.
 *
 * @param {string} configPath - Path to the site-config.json file
 * @returns {Promise<{ valid: boolean, errors?: string[], warnings: string[] }>}
 */
export default async function validateConfig(configPath) {
  const errors = [];
  const warnings = [];
  const resolvedPath = path.resolve(configPath);

  console.log(bold(`\nValidating config: ${resolvedPath}\n`));

  // ─── 1. File exists and is valid JSON ───

  if (!fs.existsSync(resolvedPath)) {
    const msg = `Config file not found: ${resolvedPath}`;
    fail(msg);
    errors.push(msg);
    return { valid: false, errors, warnings };
  }
  pass('Config file exists');

  let config;
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    config = JSON.parse(raw);
  } catch (err) {
    const msg = `Config file is not valid JSON: ${err.message}`;
    fail(msg);
    errors.push(msg);
    return { valid: false, errors, warnings };
  }
  pass('Config file is valid JSON');

  // ─── 2. Zod validation (comprehensive) ───

  console.log(dim('\n  Using Zod schema validation...\n'));

  const result = validateSiteConfig(config);

  // Report all errors
  for (const error of result.errors) {
    fail(`${error.path}: ${error.message}`);
    errors.push(`${error.path}: ${error.message}`);
  }

  // Report all warnings
  for (const warning of result.warnings) {
    warn(`${warning.path}: ${warning.message}`);
    warnings.push(`${warning.path}: ${warning.message}`);
  }

  // Summary
  console.log('');
  if (errors.length === 0) {
    console.log(green(bold(`  Validation passed with ${warnings.length} warning(s).\n`)));
    return { valid: true, warnings };
  } else {
    console.log(red(bold(`  Validation failed: ${errors.length} error(s), ${warnings.length} warning(s).\n`)));
    return { valid: false, errors, warnings };
  }
}

// ─── CLI entry point ────────────────────────────────────────────────────────
// Allows running directly: node pipeline/validate-config.js <config-path>

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMainModule) {
  const configPath = process.argv[2];

  if (!configPath) {
    console.error('Usage: node pipeline/validate-config.js <config-path>');
    process.exit(1);
  }

  validateConfig(configPath)
    .then((result) => {
      if (!result.valid) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(`[validate-config] Fatal error: ${err.message}`);
      process.exit(1);
    });
}
