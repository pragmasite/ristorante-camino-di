/**
 * TypeScript types for SiteForge configuration.
 * These types are inferred from Zod schemas, ensuring a single source of truth.
 */

import { z } from 'zod';
import {
  // Section schemas
  LocalizedTextSchema,
  CtaButtonSchema,
  SocialLinkSchema,
  HeroPropsSchema,
  ServicesPropsSchema,
  GalleryPropsSchema,
  AboutPropsSchema,
  ContactPropsSchema,
  HoursPropsSchema,
  FeaturedPropsSchema,
  TestimonialsPropsSchema,
  CtaBannerPropsSchema,
  TextBlockPropsSchema,
  MapPropsSchema,
  // Config schemas
  FontConfigSchema,
  ThemeConfigSchema,
  SeoConfigSchema,
  NavLinkSchema,
  NavigationConfigSchema,
  FooterConfigSchema,
  FooterColumnSchema,
  DisclaimerConfigSchema,
  SectionConfigSchema,
  SiteConfigSchema,
} from '../schemas/config';

// ─── Base Types ─────────────────────────────────────────────────────────────

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;
export type CtaButton = z.infer<typeof CtaButtonSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;

// ─── Theme Types ────────────────────────────────────────────────────────────

export type FontConfig = z.infer<typeof FontConfigSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// ─── SEO Types ──────────────────────────────────────────────────────────────

export type SeoConfig = z.infer<typeof SeoConfigSchema>;

// ─── Navigation Types ───────────────────────────────────────────────────────

export type NavLink = z.infer<typeof NavLinkSchema>;
export type NavigationConfig = z.infer<typeof NavigationConfigSchema>;

// ─── Footer Types ───────────────────────────────────────────────────────────

export type FooterColumn = z.infer<typeof FooterColumnSchema>;
export type FooterConfig = z.infer<typeof FooterConfigSchema>;

// ─── Disclaimer Types ───────────────────────────────────────────────────────

export type DisclaimerConfig = z.infer<typeof DisclaimerConfigSchema>;

// ─── Section Types ──────────────────────────────────────────────────────────

export type SectionConfig = z.infer<typeof SectionConfigSchema>;

export type SectionType =
  | 'hero'
  | 'services'
  | 'gallery'
  | 'about'
  | 'contact'
  | 'hours'
  | 'featured'
  | 'testimonials'
  | 'cta-banner'
  | 'text-block'
  | 'map';

// ─── Section Props Types ────────────────────────────────────────────────────

export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type ServicesProps = z.infer<typeof ServicesPropsSchema>;
export type GalleryProps = z.infer<typeof GalleryPropsSchema>;
export type AboutProps = z.infer<typeof AboutPropsSchema>;
export type ContactProps = z.infer<typeof ContactPropsSchema>;
export type HoursProps = z.infer<typeof HoursPropsSchema>;
export type FeaturedProps = z.infer<typeof FeaturedPropsSchema>;
export type TestimonialsProps = z.infer<typeof TestimonialsPropsSchema>;
export type CtaBannerProps = z.infer<typeof CtaBannerPropsSchema>;
export type TextBlockProps = z.infer<typeof TextBlockPropsSchema>;
export type MapProps = z.infer<typeof MapPropsSchema>;

// ─── Helper Types for Section Props ─────────────────────────────────────────

// Extract nested types from ServicesProps
export type ServiceItem = NonNullable<ServicesProps['services']>[number];
export type ServiceGroup = NonNullable<ServicesProps['groups']>[number];

// Extract nested types from GalleryProps
export type GalleryItem = GalleryProps['items'][number];

// ─── Main Site Config Type ──────────────────────────────────────────────────

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
