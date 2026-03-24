/**
 * Category overrides for the plugin auto-discovery system.
 *
 * Plugins are auto-discovered from the skills/ directory structure.
 * This file only defines category overrides for plugins that aren't "devtools" (the default).
 */

/** Override the default "devtools" category for specific plugins. */
export const CATEGORY_OVERRIDES: Record<string, string> = {
  api: "web-development",
  project: "web-development",
};
