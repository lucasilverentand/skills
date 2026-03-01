/**
 * Single source of truth for plugin-to-skill mapping and bundle-to-plugin mapping.
 *
 * Plugins are atomic, non-overlapping groups of skills (each skill in exactly one plugin).
 * Bundles are user-intent collections that reference plugins by name (plugins can appear in multiple).
 */

export interface PluginDef {
  description: string;
  category: string;
  skills: string[];
}

export interface BundleDef {
  description: string;
  /** Plugin names to include. Use ["*"] to include all plugins. */
  plugins: string[];
}

/** 16 atomic plugins — every SKILL.md on disk belongs to exactly one. */
export const PLUGINS: Record<string, PluginDef> = {
  git: {
    description: "Git workflow toolkit: committing, branching, conflicts, history, and worktrees",
    category: "devtools",
    skills: [
      "git/branching",
      "git/committing",
      "git/conflicts",
      "git/history",
      "git/worktrees",
    ],
  },
  planning: {
    description: "Planning toolkit: break down features, implement from plans, and record learnings",
    category: "devtools",
    skills: [
      "development/implementing",
      "development/knowledge",
      "development/planning",
    ],
  },
  workflow: {
    description: "Development workflow toolkit: debugging, refactoring, environment setup, and team orchestration",
    category: "devtools",
    skills: [
      "development/debugging",
      "development/environment",
      "development/refactoring",
      "development/team",
    ],
  },
  "code-quality": {
    description: "Code quality toolkit: testing, type safety, performance, accessibility, and error handling",
    category: "devtools",
    skills: [
      "development/accessibility",
      "development/error-handling",
      "development/performance",
      "development/testing",
      "development/type-safety",
    ],
  },
  "api-data": {
    description: "API and data toolkit: API design, database management, and schema migrations",
    category: "devtools",
    skills: [
      "development/api-design",
      "development/database",
      "development/migrations",
    ],
  },
  "project-scaffold": {
    description: "Project scaffolding toolkit: monorepo structure, workspace packages, and shared tooling",
    category: "web-development",
    skills: [
      "project/parts",
      "project/parts/cli-tool",
      "project/parts/config",
      "project/parts/logger",
      "project/parts/shared-packages",
      "project/parts/tools",
      "project/parts/types",
      "project/parts/utils",
      "project/structure",
    ],
  },
  backend: {
    description: "Backend toolkit: Hono API services, authentication, database schema, and auth configuration",
    category: "web-development",
    skills: [
      "project/parts/auth",
      "project/parts/database",
      "project/parts/hono-api",
      "project/parts/schema",
    ],
  },
  web: {
    description: "Web frontend toolkit: React dashboards, marketing websites, and shared UI components",
    category: "web-development",
    skills: [
      "project/parts/react-dashboard",
      "project/parts/ui",
      "project/parts/website",
    ],
  },
  mobile: {
    description: "Mobile development toolkit: Expo React Native and iOS/Swift app setup",
    category: "web-development",
    skills: [
      "project/parts/expo-app",
      "project/parts/ios-app",
    ],
  },
  integrations: {
    description: "Integrations toolkit: email, notifications, payments, analytics, i18n, and Discord",
    category: "devtools",
    skills: [
      "communication/discord",
      "project/parts/analytics",
      "project/parts/email",
      "project/parts/i18n",
      "project/parts/notifications",
      "project/parts/payments",
    ],
  },
  devops: {
    description: "DevOps toolkit: CI/CD, Cloudflare/Kubernetes/Railway deployment, Docker, GitOps, and secrets",
    category: "devtools",
    skills: [
      "deployment/cloudflare",
      "deployment/kubernetes",
      "deployment/railway",
      "development/ci",
      "infrastructure/docker",
      "infrastructure/gitops",
      "infrastructure/secrets",
    ],
  },
  docs: {
    description: "Documentation toolkit: READMEs, internal docs, contributor guides, and structured reports",
    category: "devtools",
    skills: [
      "documentation/contributing",
      "documentation/internal",
      "documentation/readme",
      "documentation/report",
      "documentation/report/analysis",
      "documentation/report/comparison",
      "documentation/report/research",
      "documentation/report/retro",
      "documentation/report/status",
    ],
  },
  research: {
    description: "Research toolkit: API exploration, codebase analysis, competitor and market research, UX and UI audits",
    category: "devtools",
    skills: [
      "research/api",
      "research/codebase-analysis",
      "research/competitors",
      "research/market",
      "research/technologies",
      "research/user-experience",
      "research/user-interface",
    ],
  },
  editors: {
    description: "Editor configuration toolkit: Neovim, VS Code, Zed, Xcode, and terminal setup",
    category: "editor",
    skills: [
      "editors/neovim",
      "editors/terminal",
      "editors/vscode",
      "editors/xcode",
      "editors/zed",
    ],
  },
  security: {
    description: "Security toolkit: vulnerability audits, dependency scanning, and security best practices",
    category: "devtools",
    skills: [
      "security/audit",
    ],
  },
  meta: {
    description: "Skill management toolkit: authoring skills and managing the marketplace catalog",
    category: "devtools",
    skills: [
      "skills/authoring",
      "skills/marketplace",
    ],
  },
};

/** 7 intent-based bundles — each references plugins by name. */
export const BUNDLES: Record<string, BundleDef> = {
  "full-stack-web": {
    description: "Building web apps with Hono + React + Drizzle",
    plugins: ["git", "planning", "workflow", "code-quality", "api-data", "project-scaffold", "backend", "web", "integrations", "devops", "docs"],
  },
  "mobile-dev": {
    description: "Expo/iOS apps with a backend",
    plugins: ["git", "planning", "workflow", "code-quality", "api-data", "project-scaffold", "mobile", "integrations", "backend", "docs"],
  },
  "api-backend": {
    description: "Pure API/backend work",
    plugins: ["git", "planning", "workflow", "code-quality", "api-data", "project-scaffold", "backend", "devops", "docs"],
  },
  "devops-infra": {
    description: "CI/CD, deployment, infrastructure",
    plugins: ["git", "devops", "security", "docs"],
  },
  "open-source": {
    description: "Maintaining OSS projects",
    plugins: ["git", "planning", "workflow", "code-quality", "docs", "meta", "security"],
  },
  "research-strategy": {
    description: "Research, analysis, planning",
    plugins: ["git", "research", "planning", "workflow", "docs"],
  },
  all: {
    description: "Everything",
    plugins: ["*"],
  },
};
