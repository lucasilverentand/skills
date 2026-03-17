const args = Bun.argv.slice(2);

const HELP = `
nvim-lsp-check — Verify LSP servers are installed and configured for the current project

Usage:
  bun run tools/nvim-lsp-check.ts [project-dir] [options]

Arguments:
  project-dir   Path to the project to check (default: current directory)

Options:
  --config <path>  Path to Neovim config (default: ~/.config/nvim)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Examples:
  bun run tools/nvim-lsp-check.ts
  bun run tools/nvim-lsp-check.ts ~/Developer/my-project
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const configIdx = args.indexOf("--config");
const homeDir = process.env.HOME || "~";
const configDir = configIdx !== -1 ? args[configIdx + 1] : `${homeDir}/.config/nvim`;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== configIdx + 1
);

interface LspRequirement {
  language: string;
  server: string;
  masonName: string;
  detected: boolean;
  filePatterns: string[];
}

interface LspCheckResult {
  projectDir: string;
  languages: string[];
  requirements: LspRequirement[];
  configuredServers: string[];
  installedViaMason: string[];
  missing: LspRequirement[];
}

// Map of file extensions to LSP server recommendations
const LANGUAGE_SERVERS: Record<string, { server: string; mason: string; patterns: string[] }> = {
  TypeScript: { server: "typescript-language-server", mason: "typescript-language-server", patterns: ["**/*.ts", "**/*.tsx"] },
  JavaScript: { server: "typescript-language-server", mason: "typescript-language-server", patterns: ["**/*.js", "**/*.jsx"] },
  Rust: { server: "rust-analyzer", mason: "rust-analyzer", patterns: ["**/*.rs"] },
  Go: { server: "gopls", mason: "gopls", patterns: ["**/*.go"] },
  Python: { server: "pyright", mason: "pyright", patterns: ["**/*.py"] },
  Lua: { server: "lua-ls", mason: "lua-language-server", patterns: ["**/*.lua"] },
  CSS: { server: "cssls", mason: "css-lsp", patterns: ["**/*.css", "**/*.scss"] },
  HTML: { server: "html", mason: "html-lsp", patterns: ["**/*.html"] },
  JSON: { server: "jsonls", mason: "json-lsp", patterns: ["**/*.json"] },
  YAML: { server: "yamlls", mason: "yaml-language-server", patterns: ["**/*.yaml", "**/*.yml"] },
  Astro: { server: "astro", mason: "astro-language-server", patterns: ["**/*.astro"] },
  Svelte: { server: "svelte", mason: "svelte-language-server", patterns: ["**/*.svelte"] },
  Tailwind: { server: "tailwindcss", mason: "tailwindcss-language-server", patterns: ["**/tailwind.config.*"] },
  Swift: { server: "sourcekit-lsp", mason: "sourcekit-lsp", patterns: ["**/*.swift"] },
  TOML: { server: "taplo", mason: "taplo", patterns: ["**/*.toml"] },
};

async function detectLanguages(projectDir: string): Promise<string[]> {
  const languages: string[] = [];

  for (const [lang, config] of Object.entries(LANGUAGE_SERVERS)) {
    for (const pattern of config.patterns) {
      const glob = new Bun.Glob(pattern);
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

async function getConfiguredServers(nvimConfigDir: string): Promise<string[]> {
  const resolved = nvimConfigDir.replace(/^~/, homeDir);
  const servers: string[] = [];

  const glob = new Bun.Glob("**/*.lua");
  try {
    for await (const file of glob.scan({ cwd: resolved, absolute: true })) {
      const content = await Bun.file(file).text();

      // Match lspconfig setup: lspconfig.server_name.setup
      const lspPattern = /lspconfig\.(\w+)\.setup/g;
      let match: RegExpExecArray | null;
      while ((match = lspPattern.exec(content)) !== null) {
        servers.push(match[1]);
      }

      // Match ensure_installed lists
      const ensurePattern = /ensure_installed\s*=\s*\{([^}]+)\}/g;
      while ((match = ensurePattern.exec(content)) !== null) {
        const list = match[1];
        const namePattern = /["']([^"']+)["']/g;
        let nameMatch: RegExpExecArray | null;
        while ((nameMatch = namePattern.exec(list)) !== null) {
          servers.push(nameMatch[1]);
        }
      }
    }
  } catch {
    // Config dir doesn't exist
  }

  return [...new Set(servers)];
}

async function getMasonInstalled(): Promise<string[]> {
  const masonDir = `${homeDir}/.local/share/nvim/mason/packages`;
  const installed: string[] = [];

  try {
    const proc = Bun.spawnSync(["ls", masonDir]);
    if (proc.exitCode === 0) {
      const output = proc.stdout.toString().trim();
      if (output) {
        installed.push(...output.split("\n").map((s) => s.trim()));
      }
    }
  } catch {
    // Mason not installed
  }

  return installed;
}

async function main() {
  const projectDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const languages = await detectLanguages(projectDir);
  const configuredServers = await getConfiguredServers(configDir);
  const installedViaMason = await getMasonInstalled();

  const requirements: LspRequirement[] = [];
  for (const lang of languages) {
    const config = LANGUAGE_SERVERS[lang];
    if (!config) continue;

    const isConfigured = configuredServers.some((s) =>
      s === config.server || s === config.mason || s.includes(config.server.split("-")[0])
    );
    const isInstalled = installedViaMason.includes(config.mason);

    requirements.push({
      language: lang,
      server: config.server,
      masonName: config.mason,
      detected: isConfigured || isInstalled,
      filePatterns: config.patterns,
    });
  }

  const missing = requirements.filter((r) => !r.detected);

  const result: LspCheckResult = {
    projectDir,
    languages,
    requirements,
    configuredServers,
    installedViaMason,
    missing,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Project: ${projectDir}`);
    console.log(`Languages detected: ${languages.join(", ") || "none"}\n`);

    if (requirements.length > 0) {
      console.log("LSP Requirements:");
      for (const req of requirements) {
        const status = req.detected ? "OK" : "MISSING";
        console.log(`  [${status}] ${req.language}: ${req.server}`);
        if (!req.detected) {
          console.log(`         Install: :MasonInstall ${req.masonName}`);
        }
      }
    }

    console.log(`\nConfigured servers: ${configuredServers.join(", ") || "none found in config"}`);
    console.log(`Mason packages: ${installedViaMason.length}`);

    if (missing.length > 0) {
      console.log(`\n${missing.length} server(s) not detected — install with Mason or configure manually.`);
    } else if (requirements.length > 0) {
      console.log("\nAll required LSP servers are configured.");
    }
  }

  if (missing.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
