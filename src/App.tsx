import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { LanguageProvider, useLanguage } from "@/providers/LanguageProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionRenderer } from "@/components/SectionRenderer";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { applyTheme, getGoogleFontsUrl } from "@/lib/theme";
import type { SiteConfig } from "@/types/config";

function SiteContent({ config }: { config: SiteConfig }) {
  const { t, language, languages } = useLanguage();

  // Build base URL for hreflang tags
  const baseUrl = config.url || (typeof window !== "undefined" ? window.location.origin : "");

  return (
    <>
      <Helmet>
        <html lang={language} />
        <title>{t(config.seo.title)}</title>
        <meta name="description" content={t(config.seo.description)} />
        {config.seo.keywords && (
          <meta name="keywords" content={config.seo.keywords.join(", ")} />
        )}
        {/* Canonical URL with language prefix */}
        <link rel="canonical" href={`${baseUrl}/${language}/`} />
        {/* hreflang tags for multi-language SEO */}
        {languages.map((lang) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={`${baseUrl}/${lang}/`}
          />
        ))}
        {/* x-default for language negotiation */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${baseUrl}/${config.defaultLanguage || languages[0]}/`}
        />
        {config.seo.locale && (
          <meta property="og:locale" content={config.seo.locale} />
        )}
        <meta property="og:title" content={t(config.seo.title)} />
        <meta property="og:description" content={t(config.seo.description)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/${language}/`} />
        {config.seo.ogImage && (
          <meta property="og:image" content={config.seo.ogImage} />
        )}
        {config.seo.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              ...config.seo.structuredData,
            })}
          </script>
        )}
        {/* Favicon */}
        {config.seo.favicon && (
          <link rel="icon" type="image/x-icon" href={config.seo.favicon} />
        )}
        {config.seo.appleTouchIcon && (
          <link rel="apple-touch-icon" href={config.seo.appleTouchIcon} />
        )}
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={getGoogleFontsUrl(config.theme)} rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header navigation={config.navigation} siteName={config.name} />
        <SectionRenderer sections={config.sections} />
        <Footer footer={config.footer} navigation={config.navigation} siteName={config.name} />
      </div>

      {config.disclaimer?.enabled !== false && (
        <DisclaimerModal disclaimer={config.disclaimer} />
      )}
    </>
  );
}

interface AppProps {
  config: SiteConfig;
  urlLanguage?: string;
}

export default function App({ config, urlLanguage }: AppProps) {
  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]);

  return (
    <LanguageProvider
      config={{ languages: config.languages, defaultLanguage: config.defaultLanguage }}
      urlLanguage={urlLanguage}
    >
      <SiteContent config={config} />
    </LanguageProvider>
  );
}
