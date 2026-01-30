import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { getIcon } from "@/lib/icons";
import type { CtaBannerProps } from "@/types/config";

export function CtaBanner({ id, ...props }: CtaBannerProps & { id: string }) {
  const { t } = useLanguage();

  return (
    <section id={id} className="py-16 md:py-24 relative overflow-hidden" style={props.backgroundColor ? { backgroundColor: `hsl(var(--${props.backgroundColor}))` } : undefined}>
      {props.backgroundImage && (
        <div className="absolute inset-0">
          <img src={props.backgroundImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
      )}
      {!props.backgroundImage && !props.backgroundColor && (
        <div className="absolute inset-0 bg-primary" />
      )}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-light text-primary-foreground mb-4">
          {t(props.title)}
        </h2>
        {props.subtitle && (
          <p className="text-primary-foreground/70 font-body text-lg mb-8 max-w-2xl mx-auto">
            {t(props.subtitle)}
          </p>
        )}
        {(() => {
          const CtaIcon = getIcon(props.cta.icon);
          const iconPosition = props.cta.iconPosition || "left";
          return (
            <Button variant="accent" size="xl" asChild>
              <a href={props.cta.href || (props.cta.anchor ? `#${props.cta.anchor}` : "#")}>
                {CtaIcon && iconPosition === "left" && <CtaIcon className="w-5 h-5 mr-2" />}
                {t(props.cta.label)}
                {CtaIcon && iconPosition === "right" && <CtaIcon className="w-5 h-5 ml-2" />}
              </a>
            </Button>
          );
        })()}
      </div>
    </section>
  );
}
