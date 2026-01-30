import type { LocalizedText } from "@/types/config";
import { getDefaultString } from "./defaultStrings";

let currentLanguage = "en";
let defaultLanguage = "en";
let availableLanguages: string[] = ["en"];

export function initI18n(config: {
  languages?: string[];
  defaultLanguage?: string;
}, urlLanguage?: string) {
  const configDefault = config.defaultLanguage || "en";
  const configLangs = config.languages || [];

  // If no languages specified, use defaultLanguage
  availableLanguages = configLangs.length > 0 ? [...configLangs] : [configDefault];

  // Ensure defaultLanguage is in the list
  if (!availableLanguages.includes(configDefault)) {
    availableLanguages.unshift(configDefault);
  }

  defaultLanguage = configDefault;

  // Priority: URL language > localStorage > defaultLanguage
  // URL language takes precedence because it represents an explicit user action
  if (urlLanguage && availableLanguages.includes(urlLanguage)) {
    currentLanguage = urlLanguage;
    if (typeof window !== "undefined") {
      localStorage.setItem("siteforge-language", urlLanguage);
    }
  } else if (typeof window !== "undefined") {
    const stored = localStorage.getItem("siteforge-language");
    if (stored && availableLanguages.includes(stored)) {
      currentLanguage = stored;
    } else {
      currentLanguage = defaultLanguage;
    }
  } else {
    currentLanguage = defaultLanguage;
  }
}

export function setLanguage(lang: string, updateUrl = false) {
  if (availableLanguages.includes(lang)) {
    currentLanguage = lang;
    if (typeof window !== "undefined") {
      localStorage.setItem("siteforge-language", lang);
      // Optionally update URL to reflect language change
      if (updateUrl) {
        const currentPath = window.location.pathname;
        const hash = window.location.hash;
        // Check if already has a language prefix
        const langPrefixMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/);
        if (langPrefixMatch) {
          // Replace existing language prefix
          const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${lang}`);
          window.history.replaceState(null, '', newPath + hash);
        } else {
          // Add language prefix
          window.history.replaceState(null, '', `/${lang}${currentPath}${hash}`);
        }
      }
    }
  }
}

export function getLanguage(): string {
  return currentLanguage;
}

export function getAvailableLanguages(): string[] {
  return availableLanguages;
}

export function getDefaultLanguage(): string {
  return defaultLanguage;
}

/**
 * Resolve a LocalizedText value to a string for the current language.
 * Supports:
 * - Plain strings (returned as-is)
 * - Objects with language keys { "fr": "...", "en": "..." }
 *
 * Fallback chain: current language -> default language -> first available -> key
 */
export function t(value: LocalizedText | undefined | null): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;

  // It's a localized object
  if (value[currentLanguage]) return value[currentLanguage];
  if (value[defaultLanguage]) return value[defaultLanguage];

  // Try first available language
  const firstLang = availableLanguages[0];
  if (firstLang && value[firstLang]) return value[firstLang];

  // Return first available value
  const keys = Object.keys(value);
  if (keys.length > 0) return value[keys[0]];

  return "";
}

/**
 * Get a UI string with automatic localization.
 * Looks up default strings first, allows config override via LocalizedText.
 *
 * @param key - The UI string key (e.g., "today", "closed", "loadMore")
 * @param override - Optional LocalizedText from config to override the default
 * @returns The localized string
 */
export function tui(key: string, override?: LocalizedText | undefined | null): string {
  // If override is provided, use it (supports both string and localized object)
  if (override !== undefined && override !== null) {
    return t(override);
  }
  // Otherwise, look up the default string for current language
  return getDefaultString(`ui.${key}`, currentLanguage);
}
