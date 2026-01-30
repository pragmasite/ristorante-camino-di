import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { getIcon } from "@/lib/icons";
import type { ContactProps } from "@/types/config";

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

export function Contact({ id, ...props }: ContactProps & { id: string }) {
  const { t, tui } = useLanguage();

  // Build contact items, handling multiple phone numbers
  const contactItems: Array<{ icon: any; label: string; value: string; href: string; external?: boolean }> = [];

  // Handle phone - can be string or array
  if (props.phone) {
    if (typeof props.phone === "string") {
      contactItems.push({
        icon: Phone,
        label: tui("phone"),
        value: props.phone,
        href: `tel:${props.phone.replace(/\s/g, "")}`,
      });
    } else if (Array.isArray(props.phone)) {
      props.phone.forEach((p) => {
        contactItems.push({
          icon: Phone,
          label: p.label ? t(p.label) : tui("phone"),
          value: p.number,
          href: `tel:${p.number.replace(/\s/g, "")}`,
        });
      });
    }
  }

  if (props.email) {
    contactItems.push({
      icon: Mail,
      label: tui("email"),
      value: props.email,
      href: `mailto:${props.email}`,
    });
  }

  if (props.address) {
    contactItems.push({
      icon: MapPin,
      label: tui("address"),
      value: `${props.address.street}, ${props.address.postalCode} ${props.address.city}`,
      href: props.address.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${props.address.street} ${props.address.postalCode} ${props.address.city}`)}`,
      external: true,
    });
  }

  // Check if right column content exists
  const hasRightColumn = props.mapEmbed || props.ctaCard;

  return (
    <section id={id} className="py-24 md:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        <div className={hasRightColumn ? "grid lg:grid-cols-2 gap-12 lg:gap-20" : "max-w-2xl mx-auto"}>
          {/* Left Column - Contact Info */}
          <div className={!hasRightColumn ? "text-center" : ""}>
            {props.label && (
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-accent font-body mb-4">
                {t(props.label)}
              </span>
            )}
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light mb-6">
              {t(props.title)}
            </h2>
            {props.subtitle && (
              <p className="text-primary-foreground/70 font-body text-lg leading-relaxed mb-10">
                {t(props.subtitle)}
              </p>
            )}

            {/* Contact Items */}
            <div className="space-y-6 text-left">
              {contactItems.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-foreground/10 rounded-sm group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="block text-xs tracking-[0.15em] uppercase text-primary-foreground/50 font-body mb-1">
                      {item.label}
                    </span>
                    <span className="font-body text-primary-foreground group-hover:text-accent transition-colors">
                      {item.value}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links */}
            {props.socialLinks && props.socialLinks.length > 0 && (
              <div className="space-y-6 mt-8 text-left">
                {props.socialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  const platformLabel = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-primary-foreground/10 rounded-sm group-hover:bg-accent/20 transition-colors">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="block text-xs tracking-[0.15em] uppercase text-primary-foreground/50 font-body mb-1">
                          {platformLabel}
                        </span>
                        <span className="font-body text-primary-foreground group-hover:text-accent transition-colors">
                          {link.label || link.url}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Hours inline */}
            {props.hours && (
              <div className="mt-10 pt-10 border-t border-primary-foreground/10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs tracking-[0.15em] uppercase text-primary-foreground/50 font-body">
                    {t(props.hours.label)}
                  </span>
                </div>
                <div className="space-y-2">
                  {props.hours.schedule.map((entry, i) => (
                    <div key={i} className="flex justify-between font-body">
                      <span className="text-primary-foreground/70">{t(entry.days)}</span>
                      <span className="text-primary-foreground">{t(entry.hours)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram Embed */}
            {props.instagramEmbed && (
              <div className="mt-10 pt-10 border-t border-primary-foreground/10">
                <a
                  href={`https://instagram.com/${props.instagramEmbed.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-lg group-hover:scale-105 transition-transform">
                    <Instagram className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <span className="block text-xs tracking-[0.15em] uppercase text-primary-foreground/50 font-body mb-1">
                      Instagram
                    </span>
                    <span className="font-body text-primary-foreground group-hover:text-accent transition-colors">
                      {props.instagramEmbed.displayText
                        ? t(props.instagramEmbed.displayText)
                        : `@${props.instagramEmbed.username}`}
                    </span>
                  </div>
                </a>
              </div>
            )}

            {/* Note */}
            {props.note && (
              <p className="mt-8 text-sm text-primary-foreground/50 font-body">
                {t(props.note)}
              </p>
            )}
          </div>

          {/* Right Column - CTA Card or Map */}
          <div className="flex items-center">
            {props.mapEmbed ? (
              <div className="w-full rounded-sm overflow-hidden shadow-lg">
                <iframe
                  src={props.mapEmbed}
                  width="100%"
                  height="400"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map"
                  className="grayscale transition-all duration-300 hover:grayscale-0"
                />
              </div>
            ) : props.ctaCard ? (
              <div className="w-full bg-primary-foreground/5 border border-primary-foreground/10 rounded-sm p-8 md:p-12">
                <h3 className="font-heading text-2xl md:text-3xl mb-4">
                  {t(props.ctaCard.title)}
                </h3>
                {props.ctaCard.subtitle && (
                  <p className="text-primary-foreground/70 font-body mb-8 leading-relaxed">
                    {t(props.ctaCard.subtitle)}
                  </p>
                )}
                {props.ctaCard.buttons && (
                  <div className="space-y-4">
                    {props.ctaCard.buttons.map((btn, i) => {
                      const BtnIcon = getIcon(btn.icon);
                      const iconPosition = btn.iconPosition || "left";
                      return (
                        <Button
                          key={i}
                          variant={i === 0 ? "accent" : "heroOutline"}
                          size="xl"
                          className={`w-full ${i > 0 ? "border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary" : ""}`}
                          asChild
                        >
                          <a href={btn.href || (btn.anchor ? `#${btn.anchor}` : "#")}>
                            {BtnIcon && iconPosition === "left" && <BtnIcon className="w-5 h-5 mr-2" />}
                            {t(btn.label)}
                            {BtnIcon && iconPosition === "right" && <BtnIcon className="w-5 h-5 ml-2" />}
                          </a>
                        </Button>
                      );
                    })}
                  </div>
                )}
                {/* Languages spoken */}
                {props.languages && props.languages.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-primary-foreground/10">
                    <span className="text-xs tracking-[0.15em] uppercase text-primary-foreground/50 font-body">
                      Languages
                    </span>
                    <div className="flex gap-3 mt-3">
                      {props.languages.map((lang, i) => (
                        <span key={i} className="px-3 py-1.5 text-xs font-body text-primary-foreground/70 bg-primary-foreground/5 rounded-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
