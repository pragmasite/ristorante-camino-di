#!/usr/bin/env node

/**
 * generate-metadata.js — Pre-build pipeline step
 *
 * Analyzes the config and reports on completeness of metadata.
 * Checks for missing alt text, SEO fields, structured data, etc.
 * In a production setup, this could use AI to generate alt text
 * for images that are missing it.
 */

import { readFileSync } from 'fs';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function findMissingAltText(config) {
  const missing = [];

  for (const section of config.sections || []) {
    const props = section.props || {};

    // Check gallery items
    if (section.type === 'gallery' && props.items) {
      props.items.forEach((item, i) => {
        if (!item.alt) {
          missing.push(`Gallery item ${i + 1} (${item.title || 'untitled'})`);
        }
      });
    }

    // Check hero background image
    if (section.type === 'hero' && props.backgroundImage && !props.backgroundImageAlt) {
      missing.push('Hero background image');
    }
  }

  return missing;
}

function checkSeoCompleteness(config) {
  const checks = [];
  const seo = config.seo || {};

  if (seo.title) {
    checks.push({ field: 'SEO title', status: 'ok' });
  } else {
    checks.push({ field: 'SEO title', status: 'missing' });
  }

  if (seo.description) {
    checks.push({ field: 'SEO description', status: 'ok' });
  } else {
    checks.push({ field: 'SEO description', status: 'missing' });
  }

  if (seo.keywords && seo.keywords.length > 0) {
    checks.push({ field: 'SEO keywords', status: 'ok' });
  } else {
    checks.push({ field: 'SEO keywords', status: 'warning' });
  }

  if (seo.ogImage) {
    checks.push({ field: 'Open Graph image', status: 'ok' });
  } else {
    checks.push({ field: 'Open Graph image', status: 'warning' });
  }

  if (seo.structuredData) {
    checks.push({ field: 'Structured data (JSON-LD)', status: 'ok' });
  } else {
    checks.push({ field: 'Structured data (JSON-LD)', status: 'warning' });
  }

  return checks;
}

export default async function generateMetadata(configPath) {
  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw);

  const warnings = [];

  // Check alt text
  const missingAlt = findMissingAltText(config);
  if (missingAlt.length > 0) {
    console.log(`  ${YELLOW}⚠${RESET}  Missing alt text for ${missingAlt.length} image(s):`);
    missingAlt.forEach(item => {
      console.log(`     ${DIM}— ${item}${RESET}`);
      warnings.push(`Missing alt text: ${item}`);
    });
  } else {
    console.log(`  ${GREEN}✓${RESET}  All images have alt text`);
  }

  // Check SEO completeness
  const seoChecks = checkSeoCompleteness(config);
  for (const check of seoChecks) {
    if (check.status === 'ok') {
      console.log(`  ${GREEN}✓${RESET}  ${check.field}`);
    } else if (check.status === 'warning') {
      console.log(`  ${YELLOW}⚠${RESET}  ${check.field} ${DIM}(recommended)${RESET}`);
      warnings.push(`Missing recommended: ${check.field}`);
    } else {
      console.log(`  ${RED}✗${RESET}  ${check.field} ${DIM}(missing)${RESET}`);
      warnings.push(`Missing: ${check.field}`);
    }
  }

  // Check language completeness
  if (config.languages && config.languages.length > 1) {
    console.log(`  ${GREEN}✓${RESET}  Multi-language site (${config.languages.join(', ')})`);
  } else {
    console.log(`  ${DIM}ℹ${RESET}  Single-language site (${config.defaultLanguage || 'fr'})`);
  }

  return { warnings };
}
