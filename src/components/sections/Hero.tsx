import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";
import { ChevronDown, Star } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { HeroProps, CtaButton } from "@/types/config";
import { useMotion } from "@/lib/useMotion";

function CtaButtonWithIcon({ btn, variant, className, t }: { btn: CtaButton; variant: string; className?: string; t: (text: any) => string }) {
  const Icon = getIcon(btn.icon);
  const iconPosition = btn.iconPosition || "left";

  return (
    <Button
      variant={variant as any}
      size="xl"
      className={className}
      asChild
    >
      <a href={btn.href || `#${btn.anchor}`}>
        {Icon && iconPosition === "left" && <Icon className="w-4 h-4 mr-2" />}
        {t(btn.label)}
        {Icon && iconPosition === "right" && <Icon className="w-4 h-4 ml-2" />}
      </a>
    </Button>
  );
}

// Animation variants - returns appropriate variants based on reducedMotion preference
function getAnimationVariants(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      fadeInUp: {
        hidden: { opacity: 1, y: 0 },
        visible: () => ({ opacity: 1, y: 0 }),
      },
      scaleIn: {
        hidden: { opacity: 1, scale: 1 },
        visible: () => ({ opacity: 1, scale: 1 }),
      },
      staggerContainer: {
        visible: { transition: { staggerChildren: 0 } },
      },
      staggerItem: {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      },
    };
  }

  return {
    fadeInUp: {
      hidden: { opacity: 0, y: 30 },
      visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }),
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: (delay: number = 0) => ({
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.6,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }),
    },
    staggerContainer: {
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    staggerItem: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
      },
    },
  };
}

export function Hero({ id, ...props }: HeroProps & { id: string }) {
  const { t } = useLanguage();
  const { reducedMotion } = useMotion();
  const layout = props.layout || "centered";

  // Get appropriate animation variants
  const { fadeInUp, scaleIn, staggerContainer, staggerItem } = getAnimationVariants(reducedMotion);

  if (layout === "split") {
    return (
      <section id={id} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
        {/* Decorative blobs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.2, delay: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
        />

        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div>
              {props.badge && (
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  <span className="text-xs tracking-[0.2em] uppercase text-primary font-body">
                    {t(props.badge)}
                  </span>
                </motion.div>
              )}
              <motion.h1
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 text-balance leading-[1.1]"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
              >
                {t(props.title)}
              </motion.h1>
              {props.subtitle && (
                <motion.p
                  className="text-lg md:text-xl text-muted-foreground font-body font-light max-w-xl mb-8 leading-relaxed"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                >
                  {t(props.subtitle)}
                </motion.p>
              )}
              {props.cta && props.cta.length > 0 && (
                <motion.div
                  className="flex flex-col sm:flex-row items-start gap-4"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.3}
                >
                  {props.cta.map((btn, i) => (
                    <CtaButtonWithIcon
                      key={i}
                      btn={btn}
                      variant={btn.variant === "outline" ? "heroOutline" : btn.variant === "gold" ? "accent" : "hero"}
                      t={t}
                    />
                  ))}
                </motion.div>
              )}
              {/* Stats */}
              {props.stats && props.stats.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-8 mt-10"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {props.stats.map((stat, i) => {
                    const StatIcon = getIcon(stat.icon);
                    return (
                      <motion.div key={i} className="text-center" variants={staggerItem}>
                        {StatIcon && <StatIcon className="w-5 h-5 mx-auto mb-1 text-accent" />}
                        <div className="font-heading text-2xl md:text-3xl font-light text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground font-body">{t(stat.label)}</div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
            {/* Image side */}
            {props.profileImage && (
              <motion.div
                className="relative"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                custom={0.2}
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
                  <img src={props.profileImage} alt={t(props.title)} className="w-full h-full object-cover" />
                </div>
                {props.ratingBadge && (
                  <motion.div
                    className="absolute -bottom-4 -left-4 bg-background border border-border rounded-xl p-4 shadow-lg"
                    initial={reducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: reducedMotion ? 0 : 0.6, duration: reducedMotion ? 0 : 0.5 }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <span className="text-sm font-body font-medium text-foreground">{props.ratingBadge.score} {t(props.ratingBadge.label)}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
        {props.scrollIndicator && props.scrollTarget && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 1, duration: reducedMotion ? 0 : 0.5 }}
          >
            <motion.a
              href={`#${props.scrollTarget}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
              transition={reducedMotion ? undefined : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.a>
          </motion.div>
        )}
      </section>
    );
  }

  // Default: centered layout with background image
  const blurClass = {
    none: "",
    sm: "blur-[2px]",
    md: "blur-[4px]",
    lg: "blur-[8px]",
  }[props.backgroundBlur ?? "sm"];

  // Compute grid columns based on stats count for balanced layouts
  const statsCount = props.stats?.length ?? 0;
  const statsGridClass = {
    2: "grid-cols-2",                    // 2 items: always 2 columns, centered
    3: "grid-cols-2 sm:grid-cols-3",     // 3 items: current behavior
    4: "grid-cols-2 md:grid-cols-4",     // 4 items: 2 cols on mobile, 4 on desktop
  }[statsCount] ?? "grid-cols-2 sm:grid-cols-3"; // fallback

  // Build overlay color style using theme color variables
  const overlayOpacity = props.overlayOpacity ?? 15;
  const overlayColorStyle = props.overlayColor
    ? { backgroundColor: `hsl(var(--${props.overlayColor}) / ${overlayOpacity}%)` }
    : undefined;

  return (
    <section id={id} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {props.backgroundImage && (
        <motion.div
          className="absolute inset-0"
          initial={reducedMotion ? { scale: 1 } : { scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.5, ease: "easeOut" }}
        >
          <img
            src={props.backgroundImage}
            alt={t(props.title)}
            className={`w-full h-full object-cover ${blurClass}`}
            style={blurClass ? { transform: "scale(1.02)" } : undefined}
          />
          {props.overlayGradient !== false && (
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/50 to-foreground/70" />
          )}
          {props.overlayColor && (
            <div className="absolute inset-0" style={overlayColorStyle} />
          )}
        </motion.div>
      )}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center pt-24">
        <div className="max-w-4xl mx-auto">
          {props.badge && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-background/10 backdrop-blur-sm border border-background/20 rounded-full mb-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <motion.span
                className="w-2 h-2 bg-accent rounded-full"
                animate={reducedMotion ? undefined : { scale: [1, 1.2, 1] }}
                transition={reducedMotion ? undefined : { repeat: Infinity, duration: 2 }}
              />
              <span className="text-xs tracking-[0.2em] uppercase text-background/90 font-body">
                {t(props.badge)}
              </span>
            </motion.div>
          )}
          <motion.h1
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-background mb-6 text-balance leading-[1.1]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            {t(props.title)}
          </motion.h1>
          {props.subtitle && (
            <motion.p
              className="text-lg md:text-xl text-background/80 font-body font-light max-w-2xl mx-auto mb-10 leading-relaxed"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              {t(props.subtitle)}
            </motion.p>
          )}
          {props.cta && props.cta.length > 0 && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              {props.cta.map((btn, i) => (
                <CtaButtonWithIcon
                  key={i}
                  btn={btn}
                  variant={btn.variant === "outline" ? "heroOutline" : "accent"}
                  className={btn.variant === "outline" ? "border-background/30 text-background hover:bg-background hover:text-foreground" : ""}
                  t={t}
                />
              ))}
            </motion.div>
          )}
          {/* Stats */}
          {props.stats && props.stats.length > 0 && (
            <motion.div
              className={`grid ${statsGridClass} gap-8 mt-12`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {props.stats.map((stat, i) => {
                const StatIcon = getIcon(stat.icon);
                return (
                  <motion.div key={i} className="text-center" variants={staggerItem}>
                    {StatIcon && <StatIcon className="w-6 h-6 mx-auto mb-2 text-accent" />}
                    <div className="font-heading text-3xl md:text-4xl font-light text-background mb-1">{stat.value}</div>
                    <div className="text-sm text-background/70 font-body">{t(stat.label)}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {props.quote && (
            <motion.blockquote
              className="mt-16 md:mt-24"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <p className="font-heading text-lg md:text-xl italic text-background/70 max-w-3xl mx-auto leading-relaxed">
                {t(props.quote.text)}
              </p>
              {props.quote.author && (
                <cite className="block mt-4 text-sm tracking-[0.15em] uppercase text-background/50 font-body not-italic">
                  — {props.quote.author}
                </cite>
              )}
            </motion.blockquote>
          )}
        </div>
      </div>
      {props.scrollIndicator && props.scrollTarget && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reducedMotion ? 0 : 1, duration: reducedMotion ? 0 : 0.5 }}
        >
          <motion.a
            href={`#${props.scrollTarget}`}
            className="text-background/60 hover:text-background transition-colors"
            animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
            transition={reducedMotion ? undefined : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.a>
        </motion.div>
      )}
    </section>
  );
}
