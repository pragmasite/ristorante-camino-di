import type { SiteConfig } from "@/types/config";

// The config is injected at build time via Vite's define or import
// For now, we import it as a JSON module
let _config: SiteConfig | null = null;

export function getConfig(): SiteConfig {
  if (!_config) {
    throw new Error("Site config not loaded. Call loadConfig() first.");
  }
  return _config;
}

export function loadConfig(config: SiteConfig): void {
  _config = config;
}

// Dynamic import for the config file
export async function loadConfigFromFile(): Promise<SiteConfig> {
  try {
    // Try to import site-config.json from project root
    const mod = await import("../../site-config.json");
    const config = mod.default as SiteConfig;
    _config = config;
    return config;
  } catch {
    throw new Error(
      "Could not load site-config.json. Make sure it exists in the project root."
    );
  }
}
