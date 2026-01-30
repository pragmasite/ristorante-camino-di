import { motion } from "framer-motion";
import { useLanguage } from "@/providers/LanguageProvider";
import { CheckCircle } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { AboutProps } from "@/types/config";
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

export function About({ id, ...props }: AboutProps & { id: string }) {
  const { t } = useLanguage();
  const { isMobile, reducedMotion } = useMotion();
  const imagePos = props.imagePosition || "left";

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

  // Image animation - on mobile, keep visible but animate position only
  const imageInitial = reducedMotion
    ? { opacity: 1, x: 0 }
    : isMobile
      ? { opacity: 1, x: imagePos === "right" ? 15 : -15 }
      : { opacity: 0, x: imagePos === "right" ? 30 : -30 };

  const imageAnimate = { opacity: 1, x: 0 };

  return (
    <section id={id} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${imagePos === "right" ? "" : ""}`}>
          {/* Image Column */}
          {props.image && (
            <motion.div
              className={`relative ${imagePos === "right" ? "lg:order-2" : ""}`}
              initial={imageInitial}
              whileInView={imageAnimate}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                className="aspect-[3/4] rounded-sm overflow-hidden shadow-[var(--shadow-elevated)]"
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={props.image}
                  alt={t(props.title)}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {props.floatingCard && (
                <motion.div
                  className="absolute -bottom-6 -right-6 lg:-right-10 bg-card border border-border rounded-sm p-6 shadow-[var(--shadow-elevated)] max-w-xs"
                  initial={reducedMotion ? { opacity: 1, y: 0 } : isMobile ? { opacity: 1, y: 10 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reducedMotion ? 0 : 0.3, duration: reducedMotion ? 0 : 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const Icon = getIcon(props.floatingCard.icon);
                      return Icon ? <Icon className="w-5 h-5 text-accent" /> : null;
                    })()}
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">
                      {t(props.floatingCard.label)}
                    </span>
                  </div>
                  <p className="font-heading text-lg text-foreground">
                    {t(props.floatingCard.text)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Content Column */}
          <div className={!props.image ? "lg:col-span-2 max-w-3xl mx-auto" : ""}>
            {props.label && (
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-accent font-body mb-4">
                {t(props.label)}
              </span>
            )}
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
              {t(props.title)}
            </h2>

            <div className="space-y-6 text-muted-foreground font-body leading-relaxed">
              {props.content.map((para, i) => (
                <p key={i}>{t(para)}</p>
              ))}
            </div>

            {/* Highlights (checkmark list) */}
            {props.highlights && props.highlights.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-4 mt-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {props.highlights.map((h, i) => (
                  <motion.div key={i} className="flex items-center gap-2" variants={itemVariants}>
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="font-body text-foreground">{t(h.text)}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Stats */}
            {props.stats && props.stats.length > 0 && (
              <motion.div
                className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-border"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {props.stats.map((stat, i) => {
                  const Icon = getIcon(stat.icon);
                  return (
                    <motion.div key={i} variants={itemVariants}>
                      <div className="flex items-center gap-2 mb-2">
                        {Icon && <Icon className="w-4 h-4 text-accent" />}
                        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body">
                          {t(stat.label)}
                        </span>
                      </div>
                      <p className="font-heading text-3xl text-foreground">{stat.value}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Values cards */}
            {props.values && props.values.length > 0 && (
              <motion.div
                className="grid gap-6 mt-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {props.values.map((val, i) => {
                  const Icon = getIcon(val.icon);
                  return (
                    <motion.div
                      key={i}
                      className="flex gap-4 p-4 bg-card border border-border rounded-sm"
                      variants={itemVariants}
                      whileHover={reducedMotion ? undefined : cardHover}
                    >
                      {Icon && (
                        <div className="w-10 h-10 flex items-center justify-center bg-accent/10 rounded-sm shrink-0">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-heading text-lg font-medium text-foreground mb-1">{t(val.title)}</h4>
                        <p className="text-sm text-muted-foreground font-body">{t(val.description)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Quote */}
            {props.quote && (
              <motion.blockquote
                className="mt-10 pl-6 border-l-2 border-accent"
                initial={reducedMotion ? { opacity: 1, x: 0 } : isMobile ? { opacity: 1, x: -10 } : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0 : 0.5 }}
              >
                <p className="font-heading text-lg italic text-foreground/80">
                  {t(props.quote.text)}
                </p>
                {props.quote.author && (
                  <cite className="block mt-2 text-sm text-muted-foreground font-body not-italic">
                    — {props.quote.author}
                  </cite>
                )}
              </motion.blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
