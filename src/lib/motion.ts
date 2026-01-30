import { Variants } from "framer-motion";

// Scroll reveal variants for sections
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Staggered children animation for grids/lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// ============================================
// MOBILE-SAFE VARIANTS
// Content visible by default (opacity: 1), only animate position
// Prevents blank/white sections on mobile when animations don't trigger
// ============================================

export const fadeInUpMobile: Variants = {
  hidden: {
    opacity: 1,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const staggerContainerMobile: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const staggerItemMobile: Variants = {
  hidden: {
    opacity: 1,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// ============================================
// NO MOTION VARIANTS
// For users with prefers-reduced-motion enabled
// Content appears instantly with no animation
// ============================================

export const noMotion: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export const noMotionContainer: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

// Micro-interaction variants
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const cardHover = {
  y: -4,
  transition: { duration: 0.3, ease: "easeOut" },
};

export const imageHover = {
  scale: 1.05,
  transition: { duration: 0.7, ease: "easeOut" },
};

// Viewport settings for scroll triggers
export const scrollViewport = {
  once: true,
  amount: 0.2,
  margin: "-50px",
};

// Section wrapper default settings
export const sectionMotionProps = {
  initial: "hidden",
  whileInView: "visible",
  viewport: scrollViewport,
  variants: fadeInUp,
};
