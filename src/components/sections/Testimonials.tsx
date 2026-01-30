import { useLanguage } from "@/providers/LanguageProvider";
import { Star, Quote } from "lucide-react";
import type { TestimonialsProps } from "@/types/config";

export function Testimonials({ id, ...props }: TestimonialsProps & { id: string }) {
  const { t } = useLanguage();

  return (
    <section id={id} className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {props.testimonials.map((testimonial, i) => (
            <div key={i} className="bg-card border border-border rounded-sm p-8 shadow-[var(--shadow-soft)]">
              <Quote className="w-8 h-8 text-accent/30 mb-4" />
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < testimonial.rating! ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
              )}
              <p className="font-body text-foreground leading-relaxed mb-6">
                {t(testimonial.quote)}
              </p>
              <div className="flex items-center gap-3">
                {testimonial.image && (
                  <img src={testimonial.image} alt={t(testimonial.author)} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <span className="block font-heading text-sm font-medium text-foreground">
                    {t(testimonial.author)}
                  </span>
                  {testimonial.role && (
                    <span className="block text-xs text-muted-foreground font-body">
                      {t(testimonial.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
