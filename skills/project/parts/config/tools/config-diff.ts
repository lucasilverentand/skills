const args = Bun.argv.slice(2);

const HELP = `
config-diff — Compare environment configs across .env files, highlight mismatches

Usage:
  bun run tools/config-diff.ts [path] [options]

Arguments:
  path    Path to project root containing .env files (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Compares .env, .env.example, .env.staging, .env.production files.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface EnvFileInfo {
  file: string;
  vars: Map<string, string>;
}

interface DiffEntry {
  variable: string;
  presentIn: string[];
  missingFrom: string[];
  values: Record<string, string>;
}

async function parseEnvFile(filePath: string): Promise<Map<string, string> | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  const map = new Map<string, string>();
  const content = await file.text();

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    map.set(key, value);
  }
  return map;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  const envFiles = [
    ".env.example",
    ".env",
    ".env.development",
    ".env.staging",
    ".env.production",
  ];

  const loaded: EnvFileInfo[] = [];

  for (const envFile of envFiles) {
    // Check both current dir and parent dirs (for monorepo packages)
    for (const base of [root, `${root}/../..`]) {
      const path = `${base}/${envFile}`;
      const vars = await parseEnvFile(path);
      if (vars) {
        loaded.push({ file: envFile, vars });
        break;
      }
    }
  }

  if (loaded.length < 2) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: "Need at least 2 .env files to compare", found: loaded.map((l) => l.file) }, null, 2));
    } else {
      console.log(`Found ${loaded.length} env file(s): ${loaded.map((l) => l.file).join(", ") || "none"}`);
      console.log("Need at least 2 files to compare.");
    }
    process.exit(loaded.length === 0 ? 1 : 0);
  }

  // Collect all unique variable names
  const allVars = new Set<string>();
  for (const env of loaded) {
    for (const key of env.vars.keys()) {
      allVars.add(key);
    }
  }

  const diffs: DiffEntry[] = [];
  const fileNames = loaded.map((l) => l.file);

  for (const varName of [...allVars].sort()) {
    const presentIn: string[] = [];
    const missingFrom: string[] = [];
    const values: Record<string, string> = {};

    for (const env of loaded) {
      if (env.vars.has(varName)) {
        presentIn.push(env.file);
        values[env.file] = env.vars.get(varName)!;
      } else {
        missingFrom.push(env.file);
      }
    }

    if (missingFrom.length > 0) {
      diffs.push({ variable: varName, presentIn, missingFrom, values });
    }
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          files: fileNames,
          totalVars: allVars.size,
          diffs,
          hasMismatches: diffs.length > 0,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Comparing: ${fileNames.join(", ")}`);
    console.log(`Total unique variables: ${allVars.size}\n`);

    if (diffs.length === 0) {
      console.log("All files have the same variables.");
      return;
    }

    console.log(`Mismatches (${diffs.length}):\n`);

    for (const diff of diffs) {
      console.log(`  ${diff.variable}`);
      for (const file of fileNames) {
        if (diff.values[file] !== undefined) {
          // Mask sensitive values
          const value = diff.variable.match(/SECRET|PASSWORD|KEY|TOKEN/i)
            ? "***"
            : diff.values[file] || "(empty)";
          console.log(`    [+] ${file}: ${value}`);
        } else {
          console.log(`    [ ] ${file}: MISSING`);
        }
      }
    }

    // Highlight vars in .env.example but missing from others
    const exampleFile = loaded.find((l) => l.file === ".env.example");
    if (exampleFile) {
      const missingFromEnv = diffs.filter(
        (d) =>
          d.presentIn.includes(".env.example") &&
          d.missingFrom.some((f) => f !== ".env.example")
      );
      if (missingFromEnv.length > 0) {
        console.log(
          `\n${missingFromEnv.length} variable(s) defined in .env.example but missing from other files.`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
