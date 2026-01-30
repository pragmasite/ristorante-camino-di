/**
 * Zod schema for the complete SiteForge configuration.
 * This schema validates the entire site-config.json structure,
 * including section-specific props validation.
 */

import { z } from 'zod';
import {
  LocalizedTextSchema,
  CtaButtonSchema,
  SocialLinkSchema,
  sectionPropsSchemas,
  ThemeColorSchema,
  type SectionType,
} from './sections';

/**
 * Extended theme color schema that allows:
 * - Base theme colors (primary, secondary, accent, etc.)
 * - Custom color references prefixed with "color-" (e.g., "color-rose-gold")
 *
 * Custom colors are defined in theme.colors.custom and become CSS variables
 * with the "color-" prefix (e.g., rose-gold -> --color-rose-gold).
 */
const ExtendedThemeColorSchema = z.union([
  ThemeColorSchema,
  z.string().regex(/^color-[a-z0-9-]+$/, 'Custom color must be in format "color-<name>" (e.g., "color-rose-gold")'),
]);

// ─── Font Config ────────────────────────────────────────────────────────────

export const FontConfigSchema = z.object({
  family: z.string(),
  weights: z.array(z.number().min(100).max(900)).min(1, 'At least one font weight is required'),
  fallback: z.string().optional(),
});

// ─── Theme Config ───────────────────────────────────────────────────────────

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  'primary-foreground': z.string().optional(),
  secondary: z.string().optional(),
  'secondary-foreground': z.string().optional(),
  accent: z.string().optional(),
  'accent-foreground': z.string().optional(),
  background: z.string(),
  foreground: z.string(),
  card: z.string().optional(),
  'card-foreground': z.string().optional(),
  popover: z.string().optional(),
  'popover-foreground': z.string().optional(),
  muted: z.string().optional(),
  'muted-foreground': z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
  destructive: z.string().optional(),
  'destructive-foreground': z.string().optional(),
  custom: z.record(z.string(), z.string()).optional(),
});

export const ThemeConfigSchema = z.object({
  colors: ThemeColorsSchema,
  fonts: z.object({
    heading: FontConfigSchema,
    body: FontConfigSchema,
  }),
  borderRadius: z.string().optional(),
  shadows: z.record(z.string(), z.string()).optional(),
  gradients: z.record(z.string(), z.string()).optional(),
  buttonStyle: z.object({
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).optional(),
  }).optional(),
});

// ─── SEO Config ─────────────────────────────────────────────────────────────

export const SeoConfigSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
  locale: z.string().optional(),
  structuredData: z.record(z.string(), z.any()).optional(),
  favicon: z.string().optional(),
  appleTouchIcon: z.string().optional(),
});

// ─── Navigation Config ──────────────────────────────────────────────────────

export const NavLinkSchema = z.object({
  label: LocalizedTextSchema,
  anchor: z.string(),
});

export const NavigationConfigSchema = z.object({
  links: z.array(NavLinkSchema),
  showLanguageSwitcher: z.boolean().optional(),
  logo: z.string().optional(),
  logoDark: z.string().optional(),
  logoText: LocalizedTextSchema.optional(),
  logoSubtext: LocalizedTextSchema.optional(),
  logoSubtextColor: ExtendedThemeColorSchema.optional(),
  headerStyle: z.object({
    textColorAtTop: z.enum(['light', 'dark', 'auto']).optional(),
    alwaysShowBackground: z.boolean().optional(),
    logoFilterAtTop: z.string().optional(), // CSS filter, e.g., "brightness(0) invert(1)"
  }).optional(),
  ctaButton: z.object({
    label: LocalizedTextSchema,
    anchor: z.string().optional(),
    href: z.string().optional(),
    phone: z.string().optional(),
    icon: z.string().optional(),
    iconPosition: z.enum(['left', 'right']).optional(),
  }).optional(),
});

// ─── Footer Config ──────────────────────────────────────────────────────────

export const FooterColumnSchema = z.object({
  title: LocalizedTextSchema,
  items: z.array(z.object({
    text: LocalizedTextSchema,
    href: z.string().optional(),
  })),
});

export const FooterConfigSchema = z.object({
  copyright: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  links: z.array(NavLinkSchema).optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  columns: z.array(FooterColumnSchema).optional(),
  bottomText: LocalizedTextSchema.optional(),
  logo: z.string().optional(),
  layout: z.enum(['full', 'compact', 'minimal']).optional(),
  showNavigation: z.boolean().optional(),
});

// ─── Disclaimer Config ──────────────────────────────────────────────────────

export const DisclaimerConfigSchema = z.object({
  enabled: z.boolean().optional(),
  title: LocalizedTextSchema.optional(),
  message: LocalizedTextSchema.optional(),
  bulletPoints: z.array(LocalizedTextSchema).optional(),
  buttonLabel: LocalizedTextSchema.optional(),
  icon: z.string().optional(),
});

// ─── Section Config ─────────────────────────────────────────────────────────

const VALID_SECTION_TYPES = [
  'hero',
  'services',
  'gallery',
  'about',
  'contact',
  'hours',
  'featured',
  'testimonials',
  'cta-banner',
  'text-block',
  'map',
] as const;

/**
 * Base section schema with type and id.
 * Props are validated separately using the section-specific schemas.
 */
export const SectionConfigSchema = z.object({
  type: z.enum(VALID_SECTION_TYPES),
  id: z.string(),
  props: z.record(z.string(), z.any()),
});

// ─── Pipeline Config ────────────────────────────────────────────────────────

export const PipelineConfigSchema = z.object({
  steps: z.array(z.string()).optional(),
});

// ─── Complete Site Config ───────────────────────────────────────────────────

export const SiteConfigSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  languages: z.array(z.string()).optional(),
  defaultLanguage: z.string(),
  theme: ThemeConfigSchema,
  seo: SeoConfigSchema.optional(),
  navigation: NavigationConfigSchema,
  sections: z.array(SectionConfigSchema).min(1, 'At least one section is required'),
  footer: FooterConfigSchema,
  disclaimer: DisclaimerConfigSchema.optional(),
  pipeline: PipelineConfigSchema.optional(),
}).refine(
  (data) => {
    // If languages array is provided, defaultLanguage must be in it
    if (data.languages && data.languages.length > 0) {
      return data.languages.includes(data.defaultLanguage);
    }
    return true;
  },
  {
    message: 'defaultLanguage must be included in the languages array',
    path: ['defaultLanguage'],
  }
);

// ─── Validation Helper ──────────────────────────────────────────────────────

/**
 * Validates section props against their type-specific schema.
 * Returns an array of validation errors with paths.
 */
export function validateSectionProps(
  sectionType: string,
  props: Record<string, unknown>,
  sectionIndex: number
): { path: string; message: string }[] {
  const errors: { path: string; message: string }[] = [];

  if (!(sectionType in sectionPropsSchemas)) {
    errors.push({
      path: `sections[${sectionIndex}].type`,
      message: `Unknown section type: "${sectionType}"`,
    });
    return errors;
  }

  const schema = sectionPropsSchemas[sectionType as SectionType];
  const result = schema.safeParse(props);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const propPath = issue.path.join('.');
      errors.push({
        path: `sections[${sectionIndex}].props${propPath ? '.' + propPath : ''}`,
        message: issue.message,
      });
    }
  }

  return errors;
}

/**
 * Fully validates a site configuration, including:
 * 1. Top-level structure
 * 2. Section-specific props for each section
 *
 * Returns an object with valid flag, errors array, and warnings array.
 */
export function validateSiteConfig(config: unknown): {
  valid: boolean;
  errors: { path: string; message: string }[];
  warnings: { path: string; message: string }[];
} {
  const errors: { path: string; message: string }[] = [];
  const warnings: { path: string; message: string }[] = [];

  // Step 1: Validate top-level structure
  const topLevelResult = SiteConfigSchema.safeParse(config);

  if (!topLevelResult.success) {
    for (const issue of topLevelResult.error.issues) {
      errors.push({
        path: issue.path.join('.') || '(root)',
        message: issue.message,
      });
    }
    // If top-level validation fails, we can't reliably validate sections
    return { valid: false, errors, warnings };
  }

  const validConfig = topLevelResult.data;

  // Step 2: Validate each section's props against its type-specific schema
  for (let i = 0; i < validConfig.sections.length; i++) {
    const section = validConfig.sections[i];
    const sectionErrors = validateSectionProps(section.type, section.props, i);
    errors.push(...sectionErrors);
  }

  // Step 3: Check for warnings (optional fields that might be missing)
  if (!validConfig.seo) {
    warnings.push({
      path: 'seo',
      message: 'No "seo" field found — SEO metadata will not be generated',
    });
  }

  // Check for duplicate section IDs
  const sectionIds = new Set<string>();
  for (let i = 0; i < validConfig.sections.length; i++) {
    const section = validConfig.sections[i];
    if (sectionIds.has(section.id)) {
      warnings.push({
        path: `sections[${i}].id`,
        message: `Duplicate section id "${section.id}"`,
      });
    }
    sectionIds.add(section.id);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Re-export section schemas for use in types
export * from './sections';
