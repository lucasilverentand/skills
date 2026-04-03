/**
 * Shared plugin metadata, category overrides, and bundle definitions.
 *
 * Plugins are auto-discovered from the skills/ directory structure.
 * This file only defines:
 *   1. Category overrides for plugins that aren't "devtools" (the default)
 *   2. Bundle definitions (intent-based groups of plugins)
 *   3. Shared metadata for generated Claude/Codex manifests
 */

export const REPO_PLUGIN = {
  name: "skills-of-luca",
  description:
    "Development workflow skills: debugging, testing, deployment, documentation, editor configuration, git workflows, infrastructure, project scaffolding, research, security audits, and skill authoring.",
  owner: {
    name: "Luca Silverentand",
    url: "https://github.com/lucasilverentand",
  },
  metadata: {
    homepage: "https://github.com/lucasilverentand/skills",
    repository: "https://github.com/lucasilverentand/skills",
    license: "MIT",
  },
  codex: {
    keywords: [
      "skills",
      "codex",
      "developer-tools",
      "typescript",
      "swift",
      "research",
      "security",
      "deployment",
      "documentation",
    ],
    interface: {
      displayName: "Luca Skills",
      shortDescription: "A broad, installable skills library for software work",
      longDescription:
        "Install Luca's curated skills library into Codex to get guidance and automation across TypeScript, Swift, testing, deployment, documentation, research, security, editor setup, and skill authoring workflows.",
      developerName: "Luca Silverentand",
      category: "Coding",
      capabilities: ["Interactive", "Write"],
      privacyPolicyURL: "https://github.com/lucasilverentand/skills/blob/main/README.md",
      termsOfServiceURL: "https://github.com/lucasilverentand/skills/blob/main/README.md",
      defaultPrompt: [
        "Help me use this repo's development, testing, deployment, research, and documentation skills in my project",
      ],
      composerIcon: "./assets/luca-skills-small.svg",
      logo: "./assets/luca-skills.svg",
      brandColor: "#0F172A",
    },
  },
} as const;

/** Override the default "devtools" category for specific plugins. */
export const CATEGORY_OVERRIDES: Record<string, string> = {};

/** Intent-based bundles — each references plugins by name. */
export const BUNDLES: Record<string, { description: string; plugins: string[] }> = {
  "full-stack-web": {
    description: "Building web apps with Hono + React + Drizzle",
    plugins: ["git", "development", "project", "deployment", "infrastructure", "security", "documentation"],
  },
  "mobile-dev": {
    description: "Expo/iOS/macOS apps with a backend",
    plugins: ["git", "development", "project", "communication", "security", "documentation"],
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
