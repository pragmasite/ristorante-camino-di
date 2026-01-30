import { useLanguage } from "@/providers/LanguageProvider";
import type { MapProps } from "@/types/config";

export function MapSection({ id, ...props }: MapProps & { id: string }) {
  const { t } = useLanguage();

  if (props.embedUrl) {
    return (
      <section id={id} className="py-0">
        <iframe
          src={props.embedUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location map"
          className="grayscale transition-all duration-300 hover:grayscale-0"
        />
      </section>
    );
  }

  if (props.staticImage) {
    return (
      <section id={id} className="py-0">
        <a href={props.mapsUrl || "#"} target="_blank" rel="noopener noreferrer">
          <img src={props.staticImage} alt={props.address || "Map"} className="w-full grayscale transition-all duration-300 hover:grayscale-0" />
        </a>
      </section>
    );
  }

  return null;
}
