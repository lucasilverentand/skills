const args = Bun.argv.slice(2);

const HELP = `
zed-extension-check — List installed Zed extensions and check for available updates

Usage:
  bun run tools/zed-extension-check.ts [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Examples:
  bun run tools/zed-extension-check.ts
  bun run tools/zed-extension-check.ts --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  grammars: string[];
  languages: string[];
}

interface CheckResult {
  extensionDir: string;
  extensions: ExtensionInfo[];
  totalCount: number;
}

async function getExtensionDir(): Promise<string> {
  // Zed stores extensions in different locations
  const candidates = [
    `${process.env.HOME}/.local/share/zed/extensions/installed`,
    `${process.env.HOME}/Library/Application Support/Zed/extensions/installed`,
    `${process.env.HOME}/.config/zed/extensions/installed`,
  ];

  for (const dir of candidates) {
    const proc = Bun.spawnSync(["test", "-d", dir]);
    if (proc.exitCode === 0) return dir;
  }

  // Fallback: try to find via Zed's config
  const configDir = `${process.env.HOME}/Library/Application Support/Zed`;
  return `${configDir}/extensions/installed`;
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function readTomlSafe(path: string): Promise<Record<string, string> | null> {
  try {
    const content = await Bun.file(path).text();
    const result: Record<string, string> = {};

    // Simple TOML parser for extension.toml files
    let currentSection = "";
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("[")) {
        currentSection = trimmed.replace(/[\[\]]/g, "");
        continue;
      }
      const match = trimmed.match(/^(\w+)\s*=\s*"([^"]*)"/);
      if (match) {
        const key = currentSection ? `${currentSection}.${match[1]}` : match[1];
        result[key] = match[2];
      }
    }
    return result;
  } catch {
    return null;
  }
}

async function scanExtensions(extensionDir: string): Promise<ExtensionInfo[]> {
  const extensions: ExtensionInfo[] = [];

  const proc = Bun.spawnSync(["ls", extensionDir]);
  if (proc.exitCode !== 0) return extensions;

  const dirs = proc.stdout.toString().trim().split("\n").filter(Boolean);

  for (const dir of dirs) {
    const extPath = `${extensionDir}/${dir}`;

    // Read extension.toml
    const toml = await readTomlSafe(`${extPath}/extension.toml`);

    // Also check package.json for some extensions
    const pkg = await readJsonSafe(`${extPath}/package.json`);

    const ext: ExtensionInfo = {
      id: dir,
      name: toml?.name || (pkg?.name as string) || dir,
      version: toml?.version || (pkg?.version as string) || "unknown",
      description: toml?.description || (pkg?.description as string) || "",
      grammars: [],
      languages: [],
    };

    // Scan for grammars
    const grammarGlob = new Bun.Glob("grammars/*/");
    try {
      for await (const grammar of grammarGlob.scan({ cwd: extPath })) {
        ext.grammars.push(grammar.replace("grammars/", "").replace("/", ""));
      }
    } catch {
      // No grammars directory
    }

    // Scan for languages
    const langGlob = new Bun.Glob("languages/*.toml");
    try {
      for await (const lang of langGlob.scan({ cwd: extPath })) {
        ext.languages.push(lang.replace("languages/", "").replace(".toml", ""));
      }
    } catch {
      // No languages directory
    }

    extensions.push(ext);
  }

  return extensions;
}

async function main() {
  const extensionDir = await getExtensionDir();
  const extensions = await scanExtensions(extensionDir);

  const result: CheckResult = {
    extensionDir,
    extensions,
    totalCount: extensions.length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Zed Extensions`);
    console.log(`Directory: ${extensionDir}`);
    console.log(`Installed: ${result.totalCount}\n`);

    if (extensions.length === 0) {
      console.log("No extensions found.");
      console.log("Extensions may be in a different location on your system.");
      return;
    }

    for (const ext of extensions.sort((a, b) => a.id.localeCompare(b.id))) {
      console.log(`  ${ext.id} v${ext.version}`);
      if (ext.description) {
        console.log(`    ${ext.description}`);
      }
      if (ext.languages.length > 0) {
        console.log(`    Languages: ${ext.languages.join(", ")}`);
      }
      if (ext.grammars.length > 0) {
        console.log(`    Grammars: ${ext.grammars.join(", ")}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
