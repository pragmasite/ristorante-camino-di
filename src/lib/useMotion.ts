import { useState, useEffect } from "react";

/**
 * Hook to detect mobile viewport and reduced motion preferences.
 * Used to provide appropriate animation variants:
 * - Mobile: Content visible by default, only animate position
 * - Reduced motion: No animations at all
 * - Desktop: Full fade+slide animations
 */
export function useMotion() {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check mobile viewport
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileQuery.matches);

    // Check reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    mobileQuery.addEventListener("change", handleMobile);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      mobileQuery.removeEventListener("change", handleMobile);
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  return { isMobile, reducedMotion, shouldAnimate: !reducedMotion };
}
