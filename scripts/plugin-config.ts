/**
 * Category overrides and bundle definitions.
 *
 * Plugins are auto-discovered from the skills/ directory structure.
 * This file only defines:
 *   1. Category overrides for plugins that aren't "devtools" (the default)
 *   2. Bundle definitions (intent-based groups of plugins)
 */

/** Override the default "devtools" category for specific plugins. */
export const CATEGORY_OVERRIDES: Record<string, string> = {
  project: "web-development",
};

/** Intent-based bundles — each references plugins by name. */
export const BUNDLES: Record<string, { description: string; plugins: string[] }> = {
  "full-stack-web": {
    description: "Building web apps with Hono + React + Drizzle",
    plugins: ["git", "development", "project", "deployment", "infrastructure", "security", "documentation"],
  },
  "mobile-dev": {
    description: "Expo/iOS/macOS apps with a backend",
    plugins: ["git", "development", "project", "macos", "communication", "security", "documentation"],
  },
  "api-backend": {
    description: "Pure API/backend work",
    plugins: ["git", "development", "project", "deployment", "infrastructure", "security", "documentation"],
  },
  "devops-infra": {
    description: "CI/CD, infrastructure",
    plugins: ["git", "deployment", "infrastructure", "security", "documentation"],
  },
  "open-source": {
    description: "Maintaining OSS projects",
    plugins: ["git", "development", "documentation", "skills", "security"],
  },
  "research-strategy": {
    description: "Research, analysis, planning",
    plugins: ["git", "research", "development", "security", "documentation"],
  },
  all: {
    description: "Everything",
    plugins: ["*"],
  },
};
