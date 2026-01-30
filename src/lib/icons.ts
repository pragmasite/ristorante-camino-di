import * as LucideIcons from "lucide-react";

/**
 * Get a Lucide icon component by name.
 * Returns null if the icon name is not provided or not found.
 */
export function getIcon(name?: string): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name];
  return Icon || null;
}
