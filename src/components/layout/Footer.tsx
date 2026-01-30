import { useLanguage } from "@/providers/LanguageProvider";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { FooterConfig, NavigationConfig } from "@/types/config";

const socialIconMap: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

function getSocialIcon(platform: string): LucideIcon {
  return socialIconMap[platform.toLowerCase()] || ExternalLink;
}

interface FooterProps {
  footer: FooterConfig;
  navigation: NavigationConfig;
  siteName: string;
}

export function Footer({ footer, navigation, siteName }: FooterProps) {
  const { t, tui } = useLanguage();
  const year = new Date().getFullYear();
  const layout = footer.layout || "compact";
  // For compact/minimal layouts, navigation is opt-in; for full layout, it's opt-out
  const showNavigation = layout === "full"
    ? footer.showNavigation !== false
    : footer.showNavigation === true;

  const navLinks = (footer.links || navigation.links).map((link) => ({
    href: `#${link.anchor}`,
    label: t(link.label),
  }));

  // Minimal layout - just copyright and social
  if (layout === "minimal") {
    return (
      <footer className="bg-foreground text-background py-6">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {footer.logo && (
                <img src={footer.logo} alt={siteName} className="h-6 w-auto opacity-70" />
              )}
              <span className="text-xs text-background/40 font-body">
                {footer.copyright ? t(footer.copyright) : `© ${year} ${siteName}`}
              </span>
            </div>
            {footer.socialLinks && footer.socialLinks.length > 0 && (
              <div className="flex gap-3">
                {footer.socialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center bg-background/10 rounded-sm hover:bg-accent/20 transition-colors"
                      aria-label={link.label || link.platform}
                    >
                      <Icon className="w-4 h-4 text-background/70" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Compact layout - single row with brand, nav links, social
  if (layout === "compact") {
    return (
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {footer.logo && (
                <img src={footer.logo} alt={siteName} className="h-8 w-auto" />
              )}
              <div>
                <span className="font-heading text-lg font-medium block">
                  {navigation.logoText ? t(navigation.logoText) : siteName}
                </span>
                {navigation.logoSubtext && (
                  <span className="block text-[10px] tracking-[0.15em] uppercase text-background/50 font-body">
                    {t(navigation.logoSubtext)}
                  </span>
                )}
              </div>
            </div>

            {/* Nav Links - inline */}
            {showNavigation && (
              <nav className="flex flex-wrap justify-center gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-background/70 hover:text-accent transition-colors font-body"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Social */}
            {footer.socialLinks && footer.socialLinks.length > 0 && (
              <div className="flex gap-3">
                {footer.socialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center bg-background/10 rounded-sm hover:bg-accent/20 transition-colors"
                      aria-label={link.label || link.platform}
                    >
                      <Icon className="w-4 h-4 text-background/70" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 pt-6 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-background/40 font-body">
              {footer.copyright ? t(footer.copyright) : `© ${year} ${siteName}`}
            </span>
            {footer.bottomText && (
              <span className="text-xs text-background/40 font-body">
                {t(footer.bottomText)}
              </span>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Full layout (default)
  // Count content sections for adaptive grid
  const hasCustomColumns = footer.columns && footer.columns.length > 0;
  const columnCount = 1 + (showNavigation ? 1 : 0) + (hasCustomColumns ? footer.columns!.length : 0);

  // Use multi-column nav when footer has fewer content sections to reduce height
  const useMultiColumnNav = columnCount <= 2 && navLinks.length > 3;

  // Determine grid class based on content
  const gridClass = columnCount === 1
    ? "max-w-lg"
    : columnCount === 2
      ? "grid md:grid-cols-2 gap-10 md:gap-8"
      : "grid md:grid-cols-3 gap-10 md:gap-8";

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className={gridClass}>
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {footer.logo && (
                <img src={footer.logo} alt={siteName} className="h-10 w-auto" />
              )}
              <div>
                <span className="font-heading text-xl font-medium block">
                  {navigation.logoText ? t(navigation.logoText) : siteName}
                </span>
                {navigation.logoSubtext && (
                  <span className="block text-xs tracking-[0.2em] uppercase text-background/50 font-body mt-1">
                    {t(navigation.logoSubtext)}
                  </span>
                )}
              </div>
            </div>
            {footer.description && (
              <p className="text-sm text-background/60 font-body leading-relaxed">
                {t(footer.description)}
              </p>
            )}
            {footer.socialLinks && footer.socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {footer.socialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center bg-background/10 rounded-sm hover:bg-accent/20 transition-colors"
                      aria-label={link.label || link.platform}
                    >
                      <Icon className="w-4 h-4 text-background/70" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {showNavigation && (
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase text-background/50 font-body mb-4">
                {tui("navigation")}
              </h4>
              <nav className={useMultiColumnNav ? "columns-2 gap-6" : "space-y-2"}>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`block text-sm text-background/70 hover:text-accent transition-colors font-body ${useMultiColumnNav ? "mb-2" : ""}`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Custom Columns */}
          {footer.columns && footer.columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-background/50 font-body mb-4">
                {t(col.title)}
              </h4>
              <div className="space-y-3">
                {col.items.map((item, j) => (
                  item.href ? (
                    <a key={j} href={item.href} className="block text-sm text-background/70 hover:text-accent transition-colors font-body" target="_blank" rel="noopener noreferrer">
                      {t(item.text)}
                    </a>
                  ) : (
                    <span key={j} className="block text-sm text-background/70 font-body">
                      {t(item.text)}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-background/40 font-body">
            {footer.copyright ? t(footer.copyright) : `© ${year} ${siteName}`}
          </span>
          {footer.bottomText && (
            <span className="text-xs text-background/40 font-body">
              {t(footer.bottomText)}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
