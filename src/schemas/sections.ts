/**
 * Zod schemas for all section props.
 * These schemas serve as the single source of truth for:
 * 1. Runtime validation in the pre-build pipeline
 * 2. TypeScript types via z.infer<>
 */

import { z } from 'zod';

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

// ─── Theme Color Reference ──────────────────────────────────────────────────

/**
 * Theme color names that reference CSS variables from the theme system.
 * This ensures all colors come from the centralized theme definition,
 * preventing arbitrary colors that could break visual consistency.
 */
export const ThemeColorSchema = z.enum([
  'primary',
  'secondary',
  'accent',
  'foreground',
  'background',
  'muted',
]).describe('Theme color name that maps to a CSS variable');

// ─── Reusable Schemas ───────────────────────────────────────────────────────

/**
 * Localized text: either a plain string or an object with language keys.
 * Examples:
 *   - "Hello" (single language)
 *   - { "fr": "Bonjour", "en": "Hello" } (multi-language)
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
 * CTA (Call to Action) button schema - reused across multiple sections.
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
  platform: nonEmptyString.describe('Social platform name (e.g., "instagram", "facebook")'),
  url: urlString.describe('URL to the social profile'),
  label: z.string().trim().min(1, 'Label must not be empty').optional(),
});

// ─── Section Props Schemas ──────────────────────────────────────────────────

/**
 * Hero section props.
 */
export const HeroPropsSchema = z.object({
  backgroundImage: optionalUrlString,
  backgroundBlur: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  overlayColor: ThemeColorSchema.optional(),
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
  })).min(2, 'Stats must have at least 2 items').max(4, 'Stats cannot exceed 4 items').optional(),
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
 * Service group schema (for grouped layout).
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
 * Note: phone can be a string or an array of phone objects.
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
 * Featured section props (e.g., Wine of the Month).
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
  backgroundColor: ThemeColorSchema.optional(),
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
} as const;

export type SectionType = keyof typeof sectionPropsSchemas;
