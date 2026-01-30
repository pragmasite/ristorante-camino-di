/**
 * Zod schemas for SiteForge configuration validation.
 *
 * This is a standalone JavaScript module for the pre-build pipeline.
 * It mirrors the TypeScript schemas in src/schemas/ but is directly usable
 * by Node.js without compilation.
 */

import { z } from 'zod';

// ─── Language-Specific Character Checks ─────────────────────────────────────

/**
 * Characters commonly expected in specific languages.
 * Used to warn when translations might be missing proper diacritics.
 */
const LANGUAGE_PATTERNS = {
  de: {
    name: 'German',
    // German umlauts and sharp s
    pattern: /[äöüßÄÖÜ]/,
    // Common German words that should have umlauts
    suspiciousPatterns: [
      /\bUber\b/i,      // Über
      /\bfur\b/i,       // für
      /\bGruss/i,       // Gruß/Grüß
      /\bMunchen/i,     // München
      /\bKoln/i,        // Köln
      /\bDusseldorf/i,  // Düsseldorf
      /\boffnung/i,     // Öffnung
    ],
  },
  fr: {
    name: 'French',
    // French accents
    pattern: /[àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇœŒæÆ]/,
    // Common French words that should have accents
    suspiciousPatterns: [
      /\belegant/i,     // élégant
      /\betablissement/i, // établissement
      /\bcafe\b/i,      // café
      /\bapero/i,       // apéro
      /\bhotellerie/i,  // hôtellerie
    ],
  },
};

/**
 * Check if text for a specific language might be missing proper diacritics.
 * @param {string} text - The text to check.
 * @param {string} langCode - Language code (e.g., 'de', 'fr').
 * @returns {{ suspicious: boolean, reason?: string }}
 */
function checkLanguageCharacters(text, langCode) {
  const langConfig = LANGUAGE_PATTERNS[langCode];
  if (!langConfig) return { suspicious: false };

  // Text is too short to meaningfully check
  if (text.length < 10) return { suspicious: false };

  // Check for suspicious patterns (words that should have diacritics but don't)
  for (const pattern of langConfig.suspiciousPatterns) {
    if (pattern.test(text)) {
      return {
        suspicious: true,
        reason: `${langConfig.name} text may be missing proper characters (diacritics/umlauts)`
      };
    }
  }

  return { suspicious: false };
}

// ─── Base String Validators ─────────────────────────────────────────────────

/** Non-empty string that trims whitespace */
const nonEmptyString = z.string().trim().min(1, 'Must not be empty');

/** URL string - allows relative paths or full URLs */
const urlString = z.string().trim().min(1, 'URL must not be empty').refine(
  (val) => {
    // Allow relative paths (starting with / or without protocol)
    // e.g., /assets/image.jpg, assets/image.jpg, ./image.jpg, ../image.jpg
    if (val.startsWith('/') || val.startsWith('./') || val.startsWith('../')) return true;
    // Allow asset paths without leading slash (common pattern)
    if (val.startsWith('assets/') || val.startsWith('public/')) return true;
    // Allow data URIs
    if (val.startsWith('data:')) return true;
    // Allow any path that looks like a file path (contains / and doesn't look like invalid URL)
    // This covers cases like "images/photo.jpg"
    if (val.includes('/') && !val.includes(' ') && !val.startsWith('http')) return true;
    // Validate full URLs
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid URL or relative path' }
);

/** Optional URL string */
const optionalUrlString = urlString.optional();

// ─── Reusable Schemas ───────────────────────────────────────────────────────

/**
 * Localized text: either a plain string or an object with language keys.
 *
 * Validation:
 *   - Plain strings must be non-empty (after trimming)
 *   - Records must have at least one language key
 *   - Each localized value must be non-empty (after trimming)
 */
export const LocalizedTextSchema = z.union([
  z.string().trim().min(1, 'Text must not be empty'),
  z.record(
    z.string().min(1, 'Language key must not be empty'),
    z.string().trim().min(1, 'Localized text must not be empty')
  ).refine(
    (record) => Object.keys(record).length > 0,
    { message: 'Must have at least one language' }
  ),
]);

/**
 * CTA (Call to Action) button schema.
 *
 * Validation:
 *   - label: Required, non-empty
 *   - anchor OR href: At least one must be provided
 *   - icon: Optional, but if provided must be non-empty
 */
export const CtaButtonSchema = z.object({
  label: LocalizedTextSchema,
  anchor: z.string().trim().min(1, 'Anchor must not be empty').optional(),
  href: urlString.optional(),
  variant: z.enum(['primary', 'outline', 'gold', 'secondary']).optional(),
  icon: z.string().trim().min(1, 'Icon must not be empty').optional(),
  iconPosition: z.enum(['left', 'right']).optional(),
}).refine(
  (data) => data.anchor || data.href,
  { message: 'Either "anchor" or "href" must be provided' }
);

/**
 * Social link schema.
 *
 * Validation:
 *   - platform: Required, non-empty (e.g., "instagram", "facebook")
 *   - url: Required, must be a valid URL or relative path
 *   - label: Optional, but if provided must be non-empty
 */
export const SocialLinkSchema = z.object({
  platform: nonEmptyString,
  url: urlString,
  label: z.string().trim().min(1, 'Label must not be empty').optional(),
});

// ─── Section Props Schemas ──────────────────────────────────────────────────

/**
 * Hero section props.
 */
export const HeroPropsSchema = z.object({
  backgroundImage: optionalUrlString,
  backgroundBlur: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  badge: LocalizedTextSchema.optional(),
  quote: z.object({
    text: LocalizedTextSchema,
    author: nonEmptyString.optional(),
  }).optional(),
  cta: z.array(CtaButtonSchema).optional(),
  overlayGradient: z.boolean().optional(),
  scrollIndicator: z.boolean().optional(),
  scrollTarget: nonEmptyString.optional(),
  profileImage: optionalUrlString,
  ratingBadge: z.object({
    score: nonEmptyString,
    label: LocalizedTextSchema,
  }).optional(),
  layout: z.enum(['centered', 'split']).optional(),
  stats: z.array(z.object({
    value: nonEmptyString,
    label: LocalizedTextSchema,
    icon: nonEmptyString.optional(),
  })).optional(),
});

/**
 * Service item schema.
 */
const ServiceItemSchema = z.object({
  icon: nonEmptyString.optional(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  features: z.array(LocalizedTextSchema).optional(),
});

/**
 * Service group schema.
 */
const ServiceGroupSchema = z.object({
  title: LocalizedTextSchema,
  image: optionalUrlString,
  services: z.array(ServiceItemSchema),
});

/**
 * Services section props.
 */
export const ServicesPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  services: z.array(ServiceItemSchema).optional(),
  groups: z.array(ServiceGroupSchema).optional(),
  tags: z.array(z.object({ label: LocalizedTextSchema })).optional(),
  cardSize: z.enum(['compact', 'normal', 'large']).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  highlight: z.object({
    title: LocalizedTextSchema,
    description: LocalizedTextSchema.optional(),
    image: optionalUrlString,
    tags: z.array(LocalizedTextSchema).optional(),
    stats: z.array(z.object({
      value: nonEmptyString,
      label: LocalizedTextSchema,
    })).optional(),
    cta: z.object({
      label: LocalizedTextSchema,
      anchor: nonEmptyString.optional(),
      href: optionalUrlString,
      icon: nonEmptyString.optional(),
      iconPosition: z.enum(['left', 'right']).optional(),
    }).optional(),
  }).optional(),
}).refine(
  (data) => data.services || data.groups,
  { message: 'Either "services" or "groups" must be provided' }
);

/**
 * Gallery item schema.
 */
const GalleryItemSchema = z.object({
  src: urlString,
  alt: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema.optional(),
  location: LocalizedTextSchema.optional(),
  category: LocalizedTextSchema.optional(),
});

/**
 * Gallery section props.
 */
export const GalleryPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  items: z.array(GalleryItemSchema).min(1, 'Gallery must have at least one item'),
  columns: z.number().optional(),
  aspectRatio: z.enum(['4:3', '1:1', '3:4', '16:9']).optional(),
  maxInitialItems: z.number().optional(),
  loadMoreLabel: LocalizedTextSchema.optional(),
  layout: z.enum(['grid', 'strip']).optional(),
  thumbnailSize: z.enum(['sm', 'md', 'lg']).optional(),
});

/**
 * About section props.
 */
export const AboutPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  content: z.array(LocalizedTextSchema).min(1, 'About section must have at least one content paragraph'),
  image: optionalUrlString,
  imagePosition: z.enum(['left', 'right']).optional(),
  floatingCard: z.object({
    icon: nonEmptyString.optional(),
    label: LocalizedTextSchema,
    text: LocalizedTextSchema,
  }).optional(),
  stats: z.array(z.object({
    icon: nonEmptyString.optional(),
    label: LocalizedTextSchema,
    value: nonEmptyString,
  })).optional(),
  quote: z.object({
    text: LocalizedTextSchema,
    author: nonEmptyString.optional(),
  }).optional(),
  highlights: z.array(z.object({ text: LocalizedTextSchema })).optional(),
  values: z.array(z.object({
    icon: nonEmptyString.optional(),
    title: LocalizedTextSchema,
    description: LocalizedTextSchema,
  })).optional(),
});

/**
 * Contact section props.
 */
export const ContactPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  phone: z.union([
    nonEmptyString,
    z.array(z.object({
      label: LocalizedTextSchema.optional(),
      number: nonEmptyString,
    })),
  ]).optional(),
  email: z.string().trim().min(1, 'Email must not be empty').email('Must be a valid email address').optional(),
  address: z.object({
    street: nonEmptyString,
    city: nonEmptyString,
    postalCode: nonEmptyString,
    country: nonEmptyString.optional(),
    mapsUrl: optionalUrlString,
  }).optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  hours: z.object({
    label: LocalizedTextSchema,
    schedule: z.array(z.object({
      days: LocalizedTextSchema,
      hours: LocalizedTextSchema,
    })),
  }).optional(),
  ctaCard: z.object({
    title: LocalizedTextSchema,
    subtitle: LocalizedTextSchema.optional(),
    buttons: z.array(CtaButtonSchema).optional(),
  }).optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  mapEmbed: optionalUrlString,
  languages: z.array(nonEmptyString).optional(),
  paymentMethods: z.array(nonEmptyString).optional(),
  note: LocalizedTextSchema.optional(),
  instagramEmbed: z.object({
    username: nonEmptyString,
    displayText: LocalizedTextSchema.optional(),
  }).optional(),
});

/**
 * Hours section props.
 * IMPORTANT: Each schedule entry uses "day" (singular), not "days".
 * Uses morning/afternoon/continuous for time ranges, not a generic "hours" field.
 */
export const HoursPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  schedule: z.array(z.object({
    day: LocalizedTextSchema,
    morning: nonEmptyString.optional(),
    afternoon: nonEmptyString.optional(),
    continuous: nonEmptyString.optional(),
    closed: z.boolean().optional(),
  })).min(1, 'Schedule must have at least one day entry'),
  ctaButton: z.object({
    label: LocalizedTextSchema,
    phone: nonEmptyString.optional(),
    href: optionalUrlString,
    icon: nonEmptyString.optional(),
    iconPosition: z.enum(['left', 'right']).optional(),
  }).optional(),
  paymentMethods: z.array(nonEmptyString).optional(),
  showTodayBadge: z.boolean().optional(),
  showOpenClosedBadge: z.boolean().optional(),
  timezone: nonEmptyString.optional(),
  note: LocalizedTextSchema.optional(),
  uiStrings: z.object({
    today: LocalizedTextSchema.optional(),
    closed: LocalizedTextSchema.optional(),
    paymentMethods: LocalizedTextSchema.optional(),
    open: LocalizedTextSchema.optional(),
  }).optional(),
});

/**
 * Featured section props.
 */
export const FeaturedPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  item: z.object({
    image: urlString,
    badge: LocalizedTextSchema.optional(),
    region: LocalizedTextSchema.optional(),
    name: LocalizedTextSchema,
    producer: LocalizedTextSchema.optional(),
    details: z.array(z.object({
      label: LocalizedTextSchema,
      text: LocalizedTextSchema,
    })).optional(),
    volume: nonEmptyString.optional(),
  }),
  categories: z.array(z.object({
    name: LocalizedTextSchema,
    count: LocalizedTextSchema,
  })).optional(),
});

/**
 * Testimonials section props.
 * IMPORTANT: The "testimonials" array is REQUIRED.
 */
export const TestimonialsPropsSchema = z.object({
  label: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  testimonials: z.array(z.object({
    quote: LocalizedTextSchema,
    author: LocalizedTextSchema,
    role: LocalizedTextSchema.optional(),
    rating: z.number().min(1).max(5).optional(),
    image: optionalUrlString,
  })).min(1, 'Testimonials section must have at least one testimonial'),
});

/**
 * CTA Banner section props.
 */
export const CtaBannerPropsSchema = z.object({
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  backgroundImage: optionalUrlString,
  backgroundColor: z.string().optional(),
  cta: CtaButtonSchema,
});

/**
 * Text Block section props.
 */
export const TextBlockPropsSchema = z.object({
  title: LocalizedTextSchema.optional(),
  content: LocalizedTextSchema,
});

/**
 * Map section props.
 */
export const MapPropsSchema = z.object({
  embedUrl: optionalUrlString,
  address: LocalizedTextSchema.optional(),
  mapsUrl: optionalUrlString,
  staticImage: optionalUrlString,
  title: LocalizedTextSchema.optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  zoom: z.number().optional(),
});

// ─── Section Type to Schema Map ─────────────────────────────────────────────

export const sectionPropsSchemas = {
  hero: HeroPropsSchema,
  services: ServicesPropsSchema,
  gallery: GalleryPropsSchema,
  about: AboutPropsSchema,
  contact: ContactPropsSchema,
  hours: HoursPropsSchema,
  featured: FeaturedPropsSchema,
  testimonials: TestimonialsPropsSchema,
  'cta-banner': CtaBannerPropsSchema,
  'text-block': TextBlockPropsSchema,
  map: MapPropsSchema,
};

// ─── Config Schemas ─────────────────────────────────────────────────────────

export const FontConfigSchema = z.object({
  family: nonEmptyString,
  weights: z.array(z.number().min(100).max(900)).min(1, 'At least one font weight is required'),
  fallback: nonEmptyString.optional(),
});

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

export const SeoConfigSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  keywords: z.array(nonEmptyString).optional(),
  ogImage: optionalUrlString,
  canonical: optionalUrlString,
  locale: nonEmptyString.optional(),
  structuredData: z.record(z.string(), z.any()).optional(),
  favicon: optionalUrlString,
  appleTouchIcon: optionalUrlString,
});

export const NavLinkSchema = z.object({
  label: LocalizedTextSchema,
  anchor: nonEmptyString,
});

export const NavigationConfigSchema = z.object({
  links: z.array(NavLinkSchema),
  showLanguageSwitcher: z.boolean().optional(),
  logo: optionalUrlString,
  logoDark: optionalUrlString,
  logoText: LocalizedTextSchema.optional(),
  logoSubtext: LocalizedTextSchema.optional(),
  logoSubtextColor: z.string().optional(),
  headerStyle: z.object({
    textColorAtTop: z.enum(['light', 'dark', 'auto']).optional(),
    alwaysShowBackground: z.boolean().optional(),
  }).optional(),
  ctaButton: z.object({
    label: LocalizedTextSchema,
    anchor: nonEmptyString.optional(),
    href: optionalUrlString,
    phone: nonEmptyString.optional(),
  }).optional(),
});

export const FooterColumnSchema = z.object({
  title: LocalizedTextSchema,
  items: z.array(z.object({
    text: LocalizedTextSchema,
    href: optionalUrlString,
  })),
});

export const FooterConfigSchema = z.object({
  copyright: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  links: z.array(NavLinkSchema).optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  columns: z.array(FooterColumnSchema).optional(),
  bottomText: LocalizedTextSchema.optional(),
  logo: optionalUrlString,
  layout: z.enum(['full', 'compact', 'minimal']).optional(),
  showNavigation: z.boolean().optional(),
});

export const DisclaimerConfigSchema = z.object({
  enabled: z.boolean().optional(),
  title: LocalizedTextSchema.optional(),
  message: LocalizedTextSchema.optional(),
  bulletPoints: z.array(LocalizedTextSchema).optional(),
  buttonLabel: LocalizedTextSchema.optional(),
  icon: nonEmptyString.optional(),
});

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
];

export const SectionConfigSchema = z.object({
  type: z.enum(VALID_SECTION_TYPES),
  id: nonEmptyString,
  props: z.record(z.string(), z.any()),
});

export const PipelineConfigSchema = z.object({
  steps: z.array(z.string()).optional(),
});

export const SiteConfigSchema = z.object({
  name: nonEmptyString,
  url: optionalUrlString,
  languages: z.array(nonEmptyString).optional(),
  defaultLanguage: nonEmptyString,
  theme: ThemeConfigSchema,
  seo: SeoConfigSchema.optional(),
  navigation: NavigationConfigSchema,
  sections: z.array(SectionConfigSchema).min(1, 'At least one section is required'),
  footer: FooterConfigSchema,
  disclaimer: DisclaimerConfigSchema.optional(),
  pipeline: PipelineConfigSchema.optional(),
}).refine(
  (data) => {
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

// ─── Validation Functions ───────────────────────────────────────────────────

/**
 * Validates section props against their type-specific schema.
 */
export function validateSectionProps(sectionType, props, sectionIndex) {
  const errors = [];

  if (!(sectionType in sectionPropsSchemas)) {
    errors.push({
      path: `sections[${sectionIndex}].type`,
      message: `Unknown section type: "${sectionType}"`,
    });
    return errors;
  }

  const schema = sectionPropsSchemas[sectionType];
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
 * Fully validates a site configuration.
 */
export function validateSiteConfig(config) {
  const errors = [];
  const warnings = [];

  // Step 1: Validate top-level structure
  const topLevelResult = SiteConfigSchema.safeParse(config);

  if (!topLevelResult.success) {
    for (const issue of topLevelResult.error.issues) {
      errors.push({
        path: issue.path.join('.') || '(root)',
        message: issue.message,
      });
    }
    return { valid: false, errors, warnings };
  }

  const validConfig = topLevelResult.data;

  // Step 2: Validate each section's props
  for (let i = 0; i < validConfig.sections.length; i++) {
    const section = validConfig.sections[i];
    const sectionErrors = validateSectionProps(section.type, section.props, i);
    errors.push(...sectionErrors);
  }

  // Step 3: Check for warnings
  if (!validConfig.seo) {
    warnings.push({
      path: 'seo',
      message: 'No "seo" field found — SEO metadata will not be generated',
    });
  }

  // Check for duplicate section IDs
  const sectionIds = new Set();
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

  // Step 4: Check for language-specific character issues (diacritics/umlauts)
  const languagesToCheck = validConfig.languages || [validConfig.defaultLanguage];
  const checkedTexts = new Set(); // Avoid duplicate warnings for same text

  function checkLocalizedText(obj, path) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        // Plain string - check against default language
        const lang = validConfig.defaultLanguage;
        if (['de', 'fr'].includes(lang) && !checkedTexts.has(value)) {
          checkedTexts.add(value);
          const check = checkLanguageCharacters(value, lang);
          if (check.suspicious) {
            warnings.push({
              path: currentPath,
              message: check.reason,
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Check if it's a localized text object
        const keys = Object.keys(value);
        const isLocalizedText = keys.some(k => languagesToCheck.includes(k));

        if (isLocalizedText) {
          // Check each language's text
          for (const [lang, text] of Object.entries(value)) {
            if (typeof text === 'string' && ['de', 'fr'].includes(lang)) {
              const textKey = `${lang}:${text}`;
              if (!checkedTexts.has(textKey)) {
                checkedTexts.add(textKey);
                const check = checkLanguageCharacters(text, lang);
                if (check.suspicious) {
                  warnings.push({
                    path: `${currentPath}.${lang}`,
                    message: check.reason,
                  });
                }
              }
            }
          }
        } else if (!Array.isArray(value)) {
          // Recurse into nested objects
          checkLocalizedText(value, currentPath);
        }
      }

      // Handle arrays
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            checkLocalizedText(item, `${currentPath}[${i}]`);
          }
        });
      }
    }
  }

  // Check all sections for language issues
  for (let i = 0; i < validConfig.sections.length; i++) {
    const section = validConfig.sections[i];
    checkLocalizedText(section.props, `sections[${i}].props`);
  }

  // Check navigation, footer, seo, disclaimer
  checkLocalizedText(validConfig.navigation, 'navigation');
  checkLocalizedText(validConfig.footer, 'footer');
  checkLocalizedText(validConfig.seo, 'seo');
  checkLocalizedText(validConfig.disclaimer, 'disclaimer');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
