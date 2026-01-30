import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import type { SectionConfig } from "@/types/config";
import { fadeInUp, fadeInUpMobile, noMotion, scrollViewport } from "@/lib/motion";
import { useMotion } from "@/lib/useMotion";

// Lazy load all section components for better code splitting
const Hero = lazy(() => import("@/components/sections/Hero").then(m => ({ default: m.Hero })));
const Services = lazy(() => import("@/components/sections/Services").then(m => ({ default: m.Services })));
const Gallery = lazy(() => import("@/components/sections/Gallery").then(m => ({ default: m.Gallery })));
const About = lazy(() => import("@/components/sections/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("@/components/sections/Contact").then(m => ({ default: m.Contact })));
const Hours = lazy(() => import("@/components/sections/Hours").then(m => ({ default: m.Hours })));
const Featured = lazy(() => import("@/components/sections/Featured").then(m => ({ default: m.Featured })));
const Testimonials = lazy(() => import("@/components/sections/Testimonials").then(m => ({ default: m.Testimonials })));
const CtaBanner = lazy(() => import("@/components/sections/CtaBanner").then(m => ({ default: m.CtaBanner })));
const TextBlock = lazy(() => import("@/components/sections/TextBlock").then(m => ({ default: m.TextBlock })));
const MapSection = lazy(() => import("@/components/sections/MapSection").then(m => ({ default: m.MapSection })));

const sectionMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  hero: Hero,
  services: Services,
  gallery: Gallery,
  about: About,
  contact: Contact,
  hours: Hours,
  featured: Featured,
  testimonials: Testimonials,
  "cta-banner": CtaBanner,
  "text-block": TextBlock,
  map: MapSection,
};

// Sections that handle their own internal animations
// These don't need the wrapper animation to avoid double-wrapping
const selfAnimatedSections = new Set(["hero", "services", "gallery", "about"]);

// Minimal loading fallback - just reserves space without visual indicator
function SectionFallback() {
  return <div className="min-h-[200px]" />;
}

export function SectionRenderer({ sections }: { sections: SectionConfig[] }) {
  const { isMobile, reducedMotion } = useMotion();

  // Select appropriate variants based on device/preferences
  const sectionVariants = reducedMotion
    ? noMotion
    : isMobile
      ? fadeInUpMobile
      : fadeInUp;

  return (
    <main>
      {sections.map((section) => {
        const Component = sectionMap[section.type];
        if (!Component) {
          console.warn(`Unknown section type: ${section.type}`);
          return null;
        }

        // Self-animated sections handle their own animations internally
        if (selfAnimatedSections.has(section.type)) {
          return (
            <Suspense key={section.id} fallback={<SectionFallback />}>
              <Component id={section.id} {...section.props} />
            </Suspense>
          );
        }

        // Wrap other sections with scroll reveal animation
        return (
          <Suspense key={section.id} fallback={<SectionFallback />}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewport}
              variants={sectionVariants}
            >
              <Component id={section.id} {...section.props} />
            </motion.div>
          </Suspense>
        );
      })}
    </main>
  );
}
