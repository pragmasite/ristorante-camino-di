import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import App from "./App";
import "./index.css";
import type { SiteConfig } from "@/types/config";

// Import the site config from .generated/ directory
// @ts-ignore - resolved at build time via vite alias
import siteConfig from "@config";

const config = siteConfig as unknown as SiteConfig;

// Build languages array - ensure defaultLanguage is included
const defaultLanguage = config.defaultLanguage || "en";
const configLanguages = config.languages || [];
const languages = configLanguages.length > 0
  ? configLanguages
  : [defaultLanguage]; // If no languages specified, use defaultLanguage

// Ensure defaultLanguage is in the languages array
if (!languages.includes(defaultLanguage)) {
  languages.unshift(defaultLanguage);
}

// Component that handles language from URL parameter
function LanguageRoute() {
  const { lang } = useParams<{ lang: string }>();

  // Validate language parameter
  const validLang = lang && languages.includes(lang) ? lang : null;

  if (!validLang) {
    // Invalid language, redirect to default
    return <Navigate to={`/${defaultLanguage}`} replace />;
  }

  return <App config={config} urlLanguage={validLang} />;
}

// Get initial language from localStorage or default
function getInitialLanguage(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("siteforge-language");
    if (stored && languages.includes(stored)) {
      return stored;
    }
  }
  return defaultLanguage;
}

const initialLang = getInitialLanguage();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <Routes>
        {/* Language-prefixed routes */}
        <Route path="/:lang/*" element={<LanguageRoute />} />
        {/* Root redirect to preferred/default language */}
        <Route path="/" element={<Navigate to={`/${initialLang}`} replace />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={`/${defaultLanguage}`} replace />} />
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);
