import { useLanguage } from "@/providers/LanguageProvider";
import type { TextBlockProps } from "@/types/config";

export function TextBlock({ id, ...props }: TextBlockProps & { id: string }) {
  const { t } = useLanguage();

  return (
    <section id={id} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {props.title && (
            <h2 className="font-heading text-3xl md:text-4xl font-light text-foreground mb-8">
              {t(props.title)}
            </h2>
          )}
          <div className="prose prose-lg max-w-none font-body text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t(props.content) }}
          />
        </div>
      </div>
    </section>
  );
}
