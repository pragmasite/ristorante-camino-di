import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import type { ServicesProps } from "@/types/config";
import {
  staggerContainer,
  staggerItem,
  staggerContainerMobile,
  staggerItemMobile,
  noMotion,
  noMotionContainer,
  cardHover,
} from "@/lib/motion";
import { useMotion } from "@/lib/useMotion";

export function Services({ id, ...props }: ServicesProps & { id: string }) {
  const { t } = useLanguage();
  const { isMobile, reducedMotion } = useMotion();

  // Select appropriate variants based on device/preferences
  const containerVariants = reducedMotion
    ? noMotionContainer
    : isMobile
      ? staggerContainerMobile
      : staggerContainer;

  const itemVariants = reducedMotion
    ? noMotion
    : isMobile
      ? staggerItemMobile
      : staggerItem;

  // If groups are provided, render grouped layout (like FC Paysages creation/entretien)
  if (props.groups && props.groups.length > 0) {
    return (
      <section id={id} className="py-24 md:py-32 bg-background">
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
            {props.subtitle && (
              <p className="text-muted-foreground font-body text-lg leading-relaxed">
                {t(props.subtitle)}
              </p>
            )}
          </div>

          {/* Groups */}
          <div className="space-y-16">
            {props.groups.map((group, gi) => (
              <div key={gi} className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${gi % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={gi % 2 === 1 ? "lg:order-2" : ""}>
                  <h3 className="font-heading text-2xl md:text-3xl font-medium text-foreground mb-8">
                    {t(group.title)}
                  </h3>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    {group.services.map((service, si) => {
                      const Icon = getIcon(service.icon);
                      return (
                        <motion.div
                          key={si}
                          variants={itemVariants}
                          whileHover={reducedMotion ? undefined : cardHover}
                          className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          {Icon && (
                            <div className="w-10 h-10 flex items-center justify-center bg-accent/10 rounded-lg shrink-0">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-heading text-lg font-medium text-foreground mb-1">{t(service.title)}</h4>
                            <p className="text-sm text-muted-foreground font-body">{t(service.description)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
                {group.image && (
                  <motion.div
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg ${gi % 2 === 1 ? "lg:order-1" : ""}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img src={group.image} alt={t(group.title)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/20" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Card size classes
  const cardSizeClasses = {
    compact: "p-5 md:p-6",
    normal: "p-8 md:p-10",
    large: "p-10 md:p-12",
  };
  const iconSizeClasses = {
    compact: "w-10 h-10 mb-4",
    normal: "w-14 h-14 mb-6",
    large: "w-16 h-16 mb-8",
  };
  const titleSizeClasses = {
    compact: "text-lg md:text-xl mb-2",
    normal: "text-2xl mb-4",
    large: "text-2xl md:text-3xl mb-4",
  };
  const cardSize = props.cardSize || "normal";

  // Column configuration - default to 3 columns for better space usage
  const columns = props.columns || 3;
  const gridColsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  // Default: flat services grid
  return (
    <section id={id} className="py-24 md:py-32 bg-background">
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
          {props.subtitle && (
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              {t(props.subtitle)}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <motion.div
          className={`grid ${gridColsClass} gap-6 lg:gap-8`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {props.services.map((service, index) => {
            const Icon = getIcon(service.icon);
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={reducedMotion ? undefined : cardHover}
                className={`group relative bg-card border border-border rounded-sm ${cardSizeClasses[cardSize]} hover:shadow-[var(--shadow-elevated)] transition-shadow duration-500`}
              >
                {Icon && (
                  <div className={`flex items-center justify-center bg-secondary rounded-sm ${iconSizeClasses[cardSize]} group-hover:bg-accent/10 transition-colors duration-300`}>
                    <Icon className={`${cardSize === "compact" ? "w-5 h-5" : "w-6 h-6"} text-foreground group-hover:text-accent transition-colors duration-300`} />
                  </div>
                )}
                <h3 className={`font-heading font-medium text-foreground ${titleSizeClasses[cardSize]}`}>
                  {t(service.title)}
                </h3>
                <p className={`text-muted-foreground font-body leading-relaxed ${cardSize === "compact" ? "text-sm mb-4" : "mb-6"}`}>
                  {t(service.description)}
                </p>
                {service.features && service.features.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {service.features.map((feature, fi) => (
                      <li key={fi} className="text-xs tracking-wide uppercase text-foreground/60 font-body px-3 py-1.5 bg-secondary rounded-sm">
                        {t(feature)}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-accent/40" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tags (e.g., stone types) */}
        {props.tags && props.tags.length > 0 && (
          <motion.div
            className="mt-20 pt-16 border-t border-border"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {props.tags.map((tag, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-6 py-3 bg-secondary text-foreground font-body text-sm tracking-wide rounded-sm hover:bg-accent/10 hover:text-accent transition-colors duration-300 cursor-default"
                >
                  {t(tag.label)}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Highlight Section (e.g., Spiritueux premium callout) */}
        {props.highlight && (
          <div className="mt-20 pt-16 border-t border-border">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              {props.highlight.image && (
                <motion.div
                  className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={props.highlight.image}
                    alt={t(props.highlight.title)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                </motion.div>
              )}

              {/* Content */}
              <div className={!props.highlight.image ? "lg:col-span-2 max-w-2xl mx-auto text-center" : ""}>
                <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-6">
                  {t(props.highlight.title)}
                </h3>

                {props.highlight.description && (
                  <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">
                    {t(props.highlight.description)}
                  </p>
                )}

                {/* Tags */}
                {props.highlight.tags && props.highlight.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {props.highlight.tags.map((tag, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-accent/10 text-accent font-body text-sm tracking-wide rounded-sm"
                      >
                        {t(tag)}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Stats Grid */}
                {props.highlight.stats && props.highlight.stats.length > 0 && (
                  <motion.div
                    className={`grid gap-6 mb-8 ${props.highlight.stats.length === 2 ? "grid-cols-2" : props.highlight.stats.length >= 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {props.highlight.stats.map((stat, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="text-center p-4 bg-secondary/50 rounded-sm"
                      >
                        <span className="block font-heading text-2xl md:text-3xl font-medium text-accent mb-1">
                          {stat.value}
                        </span>
                        <span className="text-sm text-muted-foreground font-body">
                          {t(stat.label)}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* CTA Button */}
                {props.highlight.cta && (() => {
                  const CtaIcon = getIcon(props.highlight.cta.icon);
                  const iconPosition = props.highlight.cta.iconPosition || "left";
                  return (
                    <Button variant="hero" size="xl" asChild>
                      <a href={props.highlight.cta.href || (props.highlight.cta.anchor ? `#${props.highlight.cta.anchor}` : "#")}>
                        {CtaIcon && iconPosition === "left" && <CtaIcon className="w-5 h-5 mr-2" />}
                        {t(props.highlight.cta.label)}
                        {CtaIcon && iconPosition === "right" && <CtaIcon className="w-5 h-5 ml-2" />}
                      </a>
                    </Button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
