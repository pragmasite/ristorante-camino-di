import type { ThemeConfig } from "@/types/config";

/**
 * Generate CSS custom properties from the theme config and inject them
 * into the document root.
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Core color tokens
  const colorKeys = [
    "primary", "primary-foreground",
    "secondary", "secondary-foreground",
    "accent", "accent-foreground",
    "background", "foreground",
    "card", "card-foreground",
    "popover", "popover-foreground",
    "muted", "muted-foreground",
    "border", "input", "ring",
    "destructive", "destructive-foreground",
  ];

  for (const key of colorKeys) {
    const value = theme.colors[key as keyof typeof theme.colors];
    if (typeof value === "string") {
      root.style.setProperty(`--${key}`, value);
    }
  }

  // Custom named colors -> --color-name and also as generic custom slots
  if (theme.colors.custom) {
    const customEntries = Object.entries(theme.colors.custom);
    customEntries.forEach(([name, value], index) => {
      root.style.setProperty(`--color-${name}`, value);
      // Map to generic custom slots for Tailwind
      const slotNum = index + 1;
      if (slotNum <= 5) {
        root.style.setProperty(`--custom${slotNum}`, value);
        root.style.setProperty(`--custom${slotNum}-light`, lightenHSL(value, 20));
      }
    });
  }

  // Shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([name, value]) => {
      root.style.setProperty(`--shadow-${name}`, value);
    });
  }

  // Gradients
  if (theme.gradients) {
    Object.entries(theme.gradients).forEach(([name, value]) => {
      root.style.setProperty(`--gradient-${name}`, value);
    });
  }

  // Border radius
  if (theme.borderRadius) {
    root.style.setProperty("--radius", theme.borderRadius);
  }

  // Button style
  if (theme.buttonStyle?.borderRadius) {
    const buttonRadiusMap: Record<string, string> = {
      none: "0",
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      full: "9999px",
    };
    const buttonRadius = buttonRadiusMap[theme.buttonStyle.borderRadius] || "0.375rem";
    root.style.setProperty("--button-radius", buttonRadius);
  }

  // Fonts
  if (theme.fonts) {
    const { heading, body } = theme.fonts;
    root.style.setProperty("--font-heading", `'${heading.family}', ${heading.fallback || "serif"}`);
    root.style.setProperty("--font-body", `'${body.family}', ${body.fallback || "sans-serif"}`);
  }
}

/**
 * Generate a Google Fonts URL from the theme config
 */
export function getGoogleFontsUrl(theme: ThemeConfig): string {
  const { heading, body } = theme.fonts;
  const families: string[] = [];

  const formatFamily = (font: { family: string; weights: number[] }) => {
    const name = font.family.replace(/\s+/g, "+");
    const italicWeights = font.weights.map(w => `1,${w}`);
    const regularWeights = font.weights.map(w => `0,${w}`);
    const allWeights = [...regularWeights, ...italicWeights].join(";");
    return `family=${name}:ital,wght@${allWeights}`;
  };

  families.push(formatFamily(heading));
  if (body.family !== heading.family) {
    families.push(formatFamily(body));
  }

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

function lightenHSL(hsl: string, amount: number): string {
  // Parse "H S% L%" format
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return hsl;
  const h = parts[0];
  const s = parts[1];
  const l = parseFloat(parts[2]);
  const newL = Math.min(100, l + amount);
  return `${h} ${s} ${newL}%`;
}
