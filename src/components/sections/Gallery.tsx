import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import type { GalleryProps } from "@/types/config";
import {
  staggerContainer,
  staggerItem,
  staggerContainerMobile,
  staggerItemMobile,
  noMotion,
  noMotionContainer,
  scaleIn,
} from "@/lib/motion";
import { useMotion } from "@/lib/useMotion";

export function Gallery({ id, ...props }: GalleryProps & { id: string }) {
  const { t } = useLanguage();
  const { isMobile, reducedMotion } = useMotion();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? props.items.length - 1 : selectedImage - 1);
    }
  };
  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === props.items.length - 1 ? 0 : selectedImage + 1);
    }
  };

  // Grid configuration
  const maxInitialItems = props.maxInitialItems || 6;
  const columns = props.columns || 3;
  const initialItems = props.items.slice(0, maxInitialItems);
  const remainingItems = props.items.slice(maxInitialItems);
  const hasMoreItems = remainingItems.length > 0;

  // Grid columns class
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  // Aspect ratio class for grid items
  const aspectRatioClass = {
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '16:9': 'aspect-video',
  }[props.aspectRatio || '4:3'];

  // Thumbnail size based on prop (default: md)
  const thumbnailSize = props.thumbnailSize || 'md';
  const thumbnailSizeClasses = {
    sm: 'w-16 h-16 md:w-20 md:h-20',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-24 h-24 md:w-32 md:h-32',
  }[thumbnailSize];

  return (
    <section id={id} className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
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

        {/* Grid - first N images */}
        <motion.div
          className={`grid ${gridCols} gap-4 md:gap-6`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {initialItems.map((item, index) => (
            <motion.button
              key={index}
              variants={itemVariants}
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => openLightbox(index)}
              className={`${aspectRatioClass} overflow-hidden rounded-sm bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary group relative`}
            >
              <img
                src={item.src}
                alt={item.alt || t(item.title) || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay with title */}
              {item.title && (
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-end">
                  <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-heading text-lg text-background">
                      {t(item.title)}
                    </h3>
                    {item.location && (
                      <p className="text-sm text-background/80 font-body">
                        {t(item.location)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Thumbnail strip - remaining images */}
        {hasMoreItems && (
          <div className="relative mt-8">
            {/* Left fade gradient */}
            <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-secondary to-transparent pointer-events-none z-10" />

            {/* Scrollable strip */}
            <div className="flex justify-center gap-3 overflow-x-auto scrollbar-hide snap-x py-4 px-12">
              {remainingItems.map((item, i) => {
                const actualIndex = maxInitialItems + i;
                return (
                  <motion.button
                    key={actualIndex}
                    whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => openLightbox(actualIndex)}
                    className={`flex-none ${thumbnailSizeClasses} snap-center overflow-hidden rounded-sm bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt || t(item.title) || `Gallery image ${actualIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Right fade gradient */}
            <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-secondary to-transparent pointer-events-none z-10" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            <motion.button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 text-background/80 hover:text-background transition-colors z-10"
              aria-label="Close"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 md:left-8 p-2 text-background/80 hover:text-background transition-colors z-10"
              aria-label="Previous"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-10 h-10" />
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 md:right-8 p-2 text-background/80 hover:text-background transition-colors z-10"
              aria-label="Next"
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-10 h-10" />
            </motion.button>
            <motion.div
              className="max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
            >
              <motion.img
                key={selectedImage}
                src={props.items[selectedImage].src}
                alt={props.items[selectedImage].alt || t(props.items[selectedImage].title)}
                className="max-w-full max-h-[75vh] object-contain rounded-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="text-center mt-4">
                {props.items[selectedImage].title && (
                  <h3 className="font-heading text-xl text-background">
                    {t(props.items[selectedImage].title)}
                  </h3>
                )}
                {props.items[selectedImage].location && (
                  <p className="text-sm text-background/60 font-body">
                    {t(props.items[selectedImage].location)}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
