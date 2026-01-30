import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { getIcon } from "@/lib/icons";
import type { NavigationConfig } from "@/types/config";

interface HeaderProps {
  navigation: NavigationConfig;
  siteName: string;
}

export function Header({ navigation, siteName }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, languages, setLanguage } = useLanguage();

  // Header style configuration
  const headerStyle = navigation.headerStyle || {};
  const textColorAtTop = headerStyle.textColorAtTop || "light";
  const alwaysShowBackground = headerStyle.alwaysShowBackground || false;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = navigation.links.map((link) => ({
    href: `#${link.anchor}`,
    label: t(link.label),
  }));

  // Determine text colors based on scroll state and headerStyle
  // Also show background when mobile menu is open to ensure visual consistency
  const showBackground = isScrolled || alwaysShowBackground || isMobileMenuOpen;
  const useLight = !showBackground && textColorAtTop === "light";
  const useDark = !showBackground && textColorAtTop === "dark";

  // Text color classes
  const logoTextClass = showBackground
    ? "text-foreground"
    : useLight
      ? "text-background"
      : "text-foreground";
  const logoSubtextClass = showBackground
    ? "text-muted-foreground"
    : useLight
      ? "text-background/70"
      : "text-muted-foreground";
  const navTextClass = showBackground
    ? "text-muted-foreground hover:text-foreground"
    : useLight
      ? "text-background/80 hover:text-background"
      : "text-muted-foreground hover:text-foreground";
  const iconTextClass = showBackground
    ? "text-foreground"
    : useLight
      ? "text-background"
      : "text-foreground";

  // Select appropriate logo based on scroll state
  const currentLogo = showBackground && navigation.logoDark
    ? navigation.logoDark
    : navigation.logo;

  // Apply CSS filter to logo when at top (allows using dark logo as light with invert)
  const logoFilter = !showBackground && headerStyle.logoFilterAtTop
    ? headerStyle.logoFilterAtTop
    : undefined;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showBackground
          ? "bg-background/95 backdrop-blur-md shadow-[var(--shadow-soft)] py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            {currentLogo && (
              <img
                src={currentLogo}
                alt={siteName}
                className="h-8 md:h-10 w-auto transition-all duration-500"
                style={logoFilter ? { filter: logoFilter } : undefined}
              />
            )}
            <div className="flex flex-col">
              <span className={`font-heading text-xl md:text-2xl font-medium tracking-wide transition-colors duration-500 ${logoTextClass}`}>
                {navigation.logoText ? t(navigation.logoText) : siteName}
              </span>
              {navigation.logoSubtext && (
                <span
                  className={`text-xs tracking-[0.2em] uppercase font-body transition-colors duration-500 ${logoSubtextClass}`}
                  style={navigation.logoSubtextColor && showBackground ? { color: `hsl(var(--${navigation.logoSubtextColor}))` } : undefined}
                >
                  {t(navigation.logoSubtext)}
                </span>
              )}
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-body tracking-wide transition-colors duration-300 relative group ${navTextClass}`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            {navigation.showLanguageSwitcher && languages.length > 1 && (
              <div className="flex items-center gap-1">
                {languages.map((lang, index) => (
                  <span key={lang} className="flex items-center">
                    <button
                      onClick={() => setLanguage(lang)}
                      className={`text-xs font-body tracking-wide transition-colors duration-300 px-1 ${
                        language === lang
                          ? showBackground ? "text-foreground font-medium" : useLight ? "text-background font-medium" : "text-foreground font-medium"
                          : showBackground ? "text-muted-foreground hover:text-foreground" : useLight ? "text-background/60 hover:text-background" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                    {index < languages.length - 1 && (
                      <span className={`text-xs ${showBackground ? "text-muted-foreground/50" : useLight ? "text-background/30" : "text-muted-foreground/50"}`}>|</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Phone icon - only show separately if there's a different destination for the CTA button */}
            {navigation.ctaButton?.phone && (navigation.ctaButton.href || navigation.ctaButton.anchor) && (
              <a
                href={`tel:${navigation.ctaButton.phone.replace(/\s/g, "")}`}
                className={`p-2 transition-colors ${navTextClass}`}
                aria-label={`Call ${navigation.ctaButton.phone}`}
              >
                <Phone className="w-5 h-5" />
              </a>
            )}

            {/* CTA Button */}
            {navigation.ctaButton && (() => {
              const isPhoneOnly = navigation.ctaButton.phone && !navigation.ctaButton.href && !navigation.ctaButton.anchor;
              const buttonHref = navigation.ctaButton.href || (navigation.ctaButton.anchor ? `#${navigation.ctaButton.anchor}` : navigation.ctaButton.phone ? `tel:${navigation.ctaButton.phone.replace(/\s/g, "")}` : "#");
              const CustomIcon = getIcon(navigation.ctaButton.icon);
              const Icon = CustomIcon || (isPhoneOnly ? Phone : null);
              const iconPosition = navigation.ctaButton.iconPosition || "left";
              return (
                <Button
                  variant={showBackground ? "hero" : "heroOutline"}
                  size="default"
                  className={!showBackground && useLight ? "border-background/40 text-background hover:bg-background hover:text-foreground" : ""}
                  asChild
                >
                  <a href={buttonHref}>
                    {Icon && iconPosition === "left" && <Icon className="w-4 h-4 mr-2" />}
                    {t(navigation.ctaButton.label)}
                    {Icon && iconPosition === "right" && <Icon className="w-4 h-4 ml-2" />}
                  </a>
                </Button>
              );
            })()}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors duration-500 ${iconTextClass}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background backdrop-blur-lg border-b border-border animate-fade-in">
            <nav className="flex flex-col py-6 px-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 text-lg font-heading text-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-6 mt-4 border-t border-border">
                {navigation.showLanguageSwitcher && languages.length > 1 && (
                  <div className="flex items-center gap-2 mb-4">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`text-xs font-body tracking-wide px-2 py-1 rounded ${
                          language === lang ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
                {/* Show phone number separately only if there's another destination */}
                {navigation.ctaButton?.phone && (navigation.ctaButton.href || navigation.ctaButton.anchor) && (
                  <a href={`tel:${navigation.ctaButton.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Phone className="w-4 h-4" />
                    <span>{navigation.ctaButton.phone}</span>
                  </a>
                )}
                {navigation.ctaButton && (() => {
                  const isPhoneOnly = navigation.ctaButton.phone && !navigation.ctaButton.href && !navigation.ctaButton.anchor;
                  const buttonHref = navigation.ctaButton.href || (navigation.ctaButton.anchor ? `#${navigation.ctaButton.anchor}` : navigation.ctaButton.phone ? `tel:${navigation.ctaButton.phone.replace(/\s/g, "")}` : "#");
                  const CustomIcon = getIcon(navigation.ctaButton.icon);
                  const Icon = CustomIcon || (isPhoneOnly ? Phone : null);
                  const iconPosition = navigation.ctaButton.iconPosition || "left";
                  return (
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <a href={buttonHref}>
                        {Icon && iconPosition === "left" && <Icon className="w-4 h-4 mr-2" />}
                        {t(navigation.ctaButton.label)}
                        {Icon && iconPosition === "right" && <Icon className="w-4 h-4 ml-2" />}
                      </a>
                    </Button>
                  );
                })()}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
