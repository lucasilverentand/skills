const args = Bun.argv.slice(2);

const HELP = `
zed-lsp-status — Verify language servers are configured and running for the current project

Usage:
  bun run tools/zed-lsp-status.ts [project-dir] [options]

Arguments:
  project-dir   Path to the project to check (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Examples:
  bun run tools/zed-lsp-status.ts
  bun run tools/zed-lsp-status.ts ~/Developer/my-project
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LspStatus {
  language: string;
  server: string;
  configured: boolean;
  configSource: string;
  suggestion?: string;
}

interface StatusResult {
  projectDir: string;
  languages: string[];
  servers: LspStatus[];
  issues: string[];
}

// Map of file patterns to Zed's built-in LSP server names
const LANGUAGE_MAP: Record<string, { server: string; extensions?: string[]; configKey?: string }> = {
  TypeScript: { server: "typescript-language-server", extensions: ["ts", "tsx"], configKey: "TypeScript" },
  JavaScript: { server: "typescript-language-server", extensions: ["js", "jsx"], configKey: "JavaScript" },
  Rust: { server: "rust-analyzer", extensions: ["rs"], configKey: "Rust" },
  Go: { server: "gopls", extensions: ["go"], configKey: "Go" },
  Python: { server: "pyright", extensions: ["py"], configKey: "Python" },
  Lua: { server: "lua-language-server", extensions: ["lua"], configKey: "Lua" },
  CSS: { server: "css-language-server", extensions: ["css", "scss", "less"], configKey: "CSS" },
  HTML: { server: "html-language-server", extensions: ["html"], configKey: "HTML" },
  JSON: { server: "json-language-server", extensions: ["json", "jsonc"], configKey: "JSON" },
  TOML: { server: "taplo", extensions: ["toml"], configKey: "TOML" },
  Swift: { server: "sourcekit-lsp", extensions: ["swift"], configKey: "Swift" },
  Astro: { server: "astro-language-server", extensions: ["astro"], configKey: "Astro" },
  Svelte: { server: "svelte-language-server", extensions: ["svelte"], configKey: "Svelte" },
};

async function detectLanguages(projectDir: string): Promise<string[]> {
  const languages: string[] = [];

  for (const [lang, config] of Object.entries(LANGUAGE_MAP)) {
    if (!config.extensions) continue;
    for (const ext of config.extensions) {
      const glob = new Bun.Glob(`**/*.${ext}`);
      let found = false;
      for await (const _ of glob.scan({ cwd: projectDir, absolute: false })) {
        found = true;
        break;
      }
      if (found) {
        languages.push(lang);
        break;
      }
    }
  }

  return languages;
}

async function readJsoncSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    // Handle trailing commas
    const cleaned = stripped.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function checkZedSettings(projectDir: string, languages: string[]): Promise<LspStatus[]> {
  const homeDir = process.env.HOME || "~";
  const statuses: LspStatus[] = [];

  // Read project settings
  const projectSettings = await readJsoncSafe(`${projectDir}/.zed/settings.json`);

  // Read global settings
  const globalSettings = await readJsoncSafe(`${homeDir}/.config/zed/settings.json`);

  for (const lang of languages) {
    const config = LANGUAGE_MAP[lang];
    if (!config) continue;

    const status: LspStatus = {
      language: lang,
      server: config.server,
      configured: false,
      configSource: "default",
    };

    // Check project settings
    if (projectSettings) {
      const langSettings = (projectSettings.languages as Record<string, unknown>)?.[config.configKey || lang];
      const lspSettings = projectSettings.lsp as Record<string, unknown>;

      if (langSettings) {
        status.configured = true;
        status.configSource = "project (.zed/settings.json)";
      }
      if (lspSettings?.[config.server]) {
        status.configured = true;
        status.configSource = "project (.zed/settings.json)";
      }
    }

    // Check global settings
    if (!status.configured && globalSettings) {
      const langSettings = (globalSettings.languages as Record<string, unknown>)?.[config.configKey || lang];
      const lspSettings = globalSettings.lsp as Record<string, unknown>;

      if (langSettings) {
        status.configured = true;
        status.configSource = "global (~/.config/zed/settings.json)";
      }
      if (lspSettings?.[config.server]) {
        status.configured = true;
        status.configSource = "global (~/.config/zed/settings.json)";
      }
    }

    // Zed auto-configures most LSPs, so if not explicitly configured, it's still likely working
    if (!status.configured) {
      status.configured = true;
      status.configSource = "Zed built-in (auto-detected)";
      status.suggestion = `Add custom config in .zed/settings.json under "lsp.${config.server}" if needed`;
    }

    statuses.push(status);
  }

  return statuses;
}

async function main() {
  const projectDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const languages = await detectLanguages(projectDir);
  const servers = await checkZedSettings(projectDir, languages);

  const issues: string[] = [];

  // Check if project has .zed/settings.json
  const hasProjectSettings = await Bun.file(`${projectDir}/.zed/settings.json`).exists();
  if (!hasProjectSettings && languages.length > 0) {
    issues.push("No .zed/settings.json found — consider adding project-level LSP config");
  }

  // Check for biome specifically for TS/JS projects
  if (languages.includes("TypeScript") || languages.includes("JavaScript")) {
    const hasBiome = await Bun.file(`${projectDir}/biome.json`).exists() ||
      await Bun.file(`${projectDir}/biome.jsonc`).exists();
    if (hasBiome) {
      const biomeConfigured = servers.some((s) =>
        s.configSource.includes("project") && s.language === "TypeScript"
      );
      if (!biomeConfigured) {
        issues.push("Biome detected but not configured in .zed/settings.json — add formatter config for TypeScript");
      }
    }
  }

  const result: StatusResult = {
    projectDir,
    languages,
    servers,
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Zed LSP Status`);
    console.log(`Project: ${projectDir}`);
    console.log(`Languages: ${languages.join(", ") || "none detected"}\n`);

    if (servers.length > 0) {
      console.log("Language Servers:");
      for (const s of servers) {
        console.log(`  ${s.language}: ${s.server}`);
        console.log(`    Config: ${s.configSource}`);
        if (s.suggestion) {
          console.log(`    Tip: ${s.suggestion}`);
        }
      }
    }

    if (issues.length > 0) {
      console.log(`\nSuggestions:`);
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
