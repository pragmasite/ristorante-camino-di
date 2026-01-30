import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { t as translate, tui as translateUi, setLanguage as setLang, getLanguage, getAvailableLanguages, initI18n } from "@/lib/i18n";
import type { LocalizedText } from "@/types/config";

interface LanguageContextType {
  language: string;
  languages: string[];
  setLanguage: (lang: string) => void;
  t: (value: LocalizedText | undefined | null) => string;
  tui: (key: string, override?: LocalizedText | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Inner provider that uses router hooks (must be inside BrowserRouter)
function LanguageProviderInner({
  children,
  urlLanguage,
}: {
  children: ReactNode;
  urlLanguage?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const availableLanguages = getAvailableLanguages();

  // Use URL language if provided, otherwise fall back to stored/default
  // Note: initI18n already handled URL language priority, so getLanguage() returns the correct value
  const initialLanguage = urlLanguage && availableLanguages.includes(urlLanguage)
    ? urlLanguage
    : getLanguage();

  const [language, setLanguageState] = useState(initialLanguage);

  // Sync language state with URL language on mount/change
  useEffect(() => {
    if (urlLanguage && availableLanguages.includes(urlLanguage) && urlLanguage !== language) {
      setLang(urlLanguage);
      setLanguageState(urlLanguage);
    }
  }, [urlLanguage, availableLanguages, language]);

  const setLanguage = useCallback((lang: string) => {
    if (availableLanguages.includes(lang)) {
      setLang(lang);
      setLanguageState(lang);

      // Update URL to reflect language change
      const currentPath = location.pathname;
      const hash = location.hash;
      // Check if already has a language prefix
      const langPrefixMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/);
      if (langPrefixMatch) {
        // Replace existing language prefix
        const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${lang}`);
        navigate(newPath + hash, { replace: true });
      } else {
        // Add language prefix
        navigate(`/${lang}${currentPath}${hash}`, { replace: true });
      }
    }
  }, [availableLanguages, navigate, location]);

  const t = useCallback((value: LocalizedText | undefined | null) => {
    return translate(value);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const tui = useCallback((key: string, override?: LocalizedText | undefined | null) => {
    return translateUi(key, override);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider
      value={{
        language,
        languages: availableLanguages,
        setLanguage,
        t,
        tui,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Main provider - initializes i18n before rendering
export function LanguageProvider({
  children,
  config,
  urlLanguage,
}: {
  children: ReactNode;
  config: { languages?: string[]; defaultLanguage?: string };
  urlLanguage?: string;
}) {
  // Initialize i18n on first render, passing URL language for priority
  initI18n(config, urlLanguage);

  return (
    <LanguageProviderInner urlLanguage={urlLanguage}>
      {children}
    </LanguageProviderInner>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
