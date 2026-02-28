const args = Bun.argv.slice(2);

const HELP = `
vscode-extension-audit — List installed VS Code extensions and flag deprecated or conflicting ones

Usage:
  bun run tools/vscode-extension-audit.ts [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Examples:
  bun run tools/vscode-extension-audit.ts
  bun run tools/vscode-extension-audit.ts --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

interface ExtensionInfo {
  id: string;
  name: string;
  publisher: string;
  version: string;
}

interface AuditResult {
  extensions: ExtensionInfo[];
  conflicts: { ext1: string; ext2: string; reason: string }[];
  deprecated: { id: string; reason: string }[];
  recommendations: string[];
  totalCount: number;
}

// Known conflicts
const KNOWN_CONFLICTS: [string, string, string][] = [
  ["dbaeumer.vscode-eslint", "biomejs.biome", "Both provide JS/TS linting — use one or the other"],
  ["esbenp.prettier-vscode", "biomejs.biome", "Both provide formatting — Biome replaces Prettier for JS/TS"],
  ["ms-vscode.vscode-typescript-tslint-plugin", "dbaeumer.vscode-eslint", "TSLint is deprecated — use ESLint or Biome"],
  ["hookyqr.beautify", "esbenp.prettier-vscode", "Beautify is deprecated — use Prettier or Biome"],
  ["eg2.vscode-npm-script", "ms-vscode.npm-intellisense", "Overlapping npm features"],
];

// Known deprecated extensions
const DEPRECATED_EXTENSIONS: Record<string, string> = {
  "ms-vscode.vscode-typescript-tslint-plugin": "TSLint is deprecated, migrate to ESLint or Biome",
  "hookyqr.beautify": "No longer maintained, use Prettier or Biome",
  "msjsdiag.debugger-for-chrome": "Built into VS Code as js-debug, remove this extension",
  "ms-vscode.node-debug": "Replaced by built-in js-debug",
  "ms-vscode.node-debug2": "Replaced by built-in js-debug",
  "eg2.tslint": "TSLint is deprecated",
  "dzannotti.vscode-babel-coloring": "Built-in syntax highlighting covers this now",
  "robertoachar.vscode-essentials": "Meta-extension, install individual extensions instead",
};

async function getInstalledExtensions(): Promise<ExtensionInfo[]> {
  const proc = Bun.spawnSync(["code", "--list-extensions", "--show-versions"], {
    timeout: 15_000,
    env: { ...process.env },
  });

  if (proc.exitCode !== 0) {
    // Try code-insiders
    const insidersProc = Bun.spawnSync(["code-insiders", "--list-extensions", "--show-versions"], {
      timeout: 15_000,
      env: { ...process.env },
    });

    if (insidersProc.exitCode !== 0) {
      console.error("Error: could not list VS Code extensions. Is 'code' in PATH?");
      console.error("Run: VS Code > Cmd+Shift+P > 'Shell Command: Install code command'");
      process.exit(1);
    }

    return parseExtensionList(insidersProc.stdout.toString());
  }

  return parseExtensionList(proc.stdout.toString());
}

function parseExtensionList(output: string): ExtensionInfo[] {
  return output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [fullId, version] = line.split("@");
      const [publisher, name] = fullId.split(".");
      return {
        id: fullId.toLowerCase(),
        name: name || fullId,
        publisher: publisher || "",
        version: version || "unknown",
      };
    });
}

function auditExtensions(extensions: ExtensionInfo[]): AuditResult {
  const extIds = new Set(extensions.map((e) => e.id));

  // Find conflicts
  const conflicts: AuditResult["conflicts"] = [];
  for (const [ext1, ext2, reason] of KNOWN_CONFLICTS) {
    if (extIds.has(ext1.toLowerCase()) && extIds.has(ext2.toLowerCase())) {
      conflicts.push({ ext1, ext2, reason });
    }
  }

  // Find deprecated
  const deprecated: AuditResult["deprecated"] = [];
  for (const [id, reason] of Object.entries(DEPRECATED_EXTENSIONS)) {
    if (extIds.has(id.toLowerCase())) {
      deprecated.push({ id, reason });
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (!extIds.has("biomejs.biome") && !extIds.has("dbaeumer.vscode-eslint")) {
    recommendations.push("No JS/TS linter detected — consider installing biomejs.biome");
  }
  if (!extIds.has("bradlc.vscode-tailwindcss")) {
    // Only recommend if project uses Tailwind — we can't check that here, so skip
  }

  return {
    extensions,
    conflicts,
    deprecated,
    recommendations,
    totalCount: extensions.length,
  };
}

async function main() {
  const extensions = await getInstalledExtensions();
  const result = auditExtensions(extensions);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`VS Code Extension Audit`);
    console.log(`Installed: ${result.totalCount}\n`);

    console.log("Extensions:");
    for (const ext of result.extensions.sort((a, b) => a.id.localeCompare(b.id))) {
      console.log(`  ${ext.id}@${ext.version}`);
    }

    if (result.deprecated.length > 0) {
      console.log(`\nDeprecated (${result.deprecated.length}):`);
      for (const d of result.deprecated) {
        console.log(`  ${d.id}`);
        console.log(`    ${d.reason}`);
      }
    }

    if (result.conflicts.length > 0) {
      console.log(`\nConflicts (${result.conflicts.length}):`);
      for (const c of result.conflicts) {
        console.log(`  ${c.ext1} vs ${c.ext2}`);
        console.log(`    ${c.reason}`);
      }
    }

    if (result.recommendations.length > 0) {
      console.log("\nRecommendations:");
      for (const r of result.recommendations) {
        console.log(`  - ${r}`);
      }
    }

    if (result.deprecated.length === 0 && result.conflicts.length === 0) {
      console.log("\nNo issues found.");
    }
  }

  if (result.deprecated.length > 0 || result.conflicts.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
