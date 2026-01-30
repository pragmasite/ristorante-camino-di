import { useLanguage } from "@/providers/LanguageProvider";
import { Wine, Star } from "lucide-react";
import type { FeaturedProps } from "@/types/config";

export function Featured({ id, ...props }: FeaturedProps & { id: string }) {
  const { t } = useLanguage();

  return (
    <section id={id} className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          {props.label && (
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-accent font-body mb-4">
              {t(props.label)}
            </span>
          )}
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
            {t(props.title)}
          </h2>
          {props.description && (
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              {t(props.description)}
            </p>
          )}
        </div>

        {/* Featured Item Card */}
        <div className="max-w-5xl mx-auto bg-card border border-border rounded-sm overflow-hidden shadow-[var(--shadow-elevated)]">
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative bg-secondary aspect-square md:aspect-auto">
              <img
                src={props.item.image}
                alt={t(props.item.name)}
                className="w-full h-full object-cover"
              />
              {props.item.badge && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-body tracking-wide">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  {t(props.item.badge)}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 md:p-10 lg:p-12">
              {props.item.region && (
                <div className="inline-flex items-center gap-2 text-accent mb-4">
                  <Wine className="w-4 h-4" />
                  <span className="text-xs tracking-[0.2em] uppercase font-body">
                    {t(props.item.region)}
                  </span>
                </div>
              )}
              <h3 className="font-heading text-2xl md:text-3xl font-medium text-foreground mb-2">
                {t(props.item.name)}
              </h3>
              {props.item.producer && (
                <p className="text-sm text-muted-foreground font-body mb-6">
                  {t(props.item.producer)}
                </p>
              )}

              {/* Details list */}
              {props.item.details && props.item.details.length > 0 && (
                <div className="space-y-4 mb-6">
                  {props.item.details.map((detail, i) => (
                    <div key={i}>
                      <span className="block text-xs tracking-[0.15em] uppercase text-accent font-body mb-1">
                        {t(detail.label)}
                      </span>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {t(detail.text)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {props.item.volume && (
                <span className="inline-block text-xs text-muted-foreground font-body bg-secondary px-3 py-1.5 rounded-sm">
                  {props.item.volume}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Categories preview */}
        {props.categories && props.categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {props.categories.map((cat, i) => (
              <div key={i} className="text-center p-6 bg-card border border-border rounded-sm">
                <h4 className="font-heading text-lg font-medium text-foreground mb-1">{t(cat.name)}</h4>
                <span className="text-sm text-muted-foreground font-body">{t(cat.count)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
