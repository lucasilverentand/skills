const args = Bun.argv.slice(2);

const HELP = `
badge-sync — Generate and update status badges for CI, coverage, and npm version

Usage:
  bun run tools/badge-sync.ts [repo-dir] [options]

Arguments:
  repo-dir   Path to the repository root (default: current directory)

Options:
  --readme <path>  Path to README file to update (default: README.md in repo root)
  --json           Output badge markdown as JSON instead of updating the file
  --help           Show this help message

Examples:
  bun run tools/badge-sync.ts
  bun run tools/badge-sync.ts ~/Developer/my-lib --json
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const readmeIdx = args.indexOf("--readme");
const readmePath = readmeIdx !== -1 ? args[readmeIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== readmeIdx + 1
);

interface Badge {
  name: string;
  markdown: string;
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function getGitRemote(repoDir: string): Promise<{ owner: string; repo: string } | null> {
  try {
    const proc = Bun.spawnSync(["git", "remote", "get-url", "origin"], { cwd: repoDir });
    const url = proc.stdout.toString().trim();

    // Parse GitHub URL
    const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  } catch {
    // Not a git repo
  }
  return null;
}

async function detectBadges(repoDir: string): Promise<Badge[]> {
  const badges: Badge[] = [];
  const pkg = await readJsonSafe(`${repoDir}/package.json`);
  const remote = await getGitRemote(repoDir);

  // CI badge (GitHub Actions)
  if (remote && await fileExists(`${repoDir}/.github/workflows`)) {
    // Find workflow files
    const glob = new Bun.Glob("*.{yml,yaml}");
    for await (const file of glob.scan({ cwd: `${repoDir}/.github/workflows` })) {
      const workflowName = file.replace(/\.ya?ml$/, "");
      badges.push({
        name: `CI (${workflowName})`,
        markdown: `[![${workflowName}](https://github.com/${remote.owner}/${remote.repo}/actions/workflows/${file}/badge.svg)](https://github.com/${remote.owner}/${remote.repo}/actions/workflows/${file})`,
      });
      break; // Only add the first workflow badge
    }
  }

  // npm version badge
  if (pkg && !pkg.private && pkg.name) {
    const name = pkg.name as string;
    badges.push({
      name: "npm version",
      markdown: `[![npm version](https://img.shields.io/npm/v/${name})](https://www.npmjs.com/package/${name})`,
    });

    // npm downloads
    badges.push({
      name: "npm downloads",
      markdown: `[![npm downloads](https://img.shields.io/npm/dm/${name})](https://www.npmjs.com/package/${name})`,
    });
  }

  // License badge
  if (pkg?.license) {
    const license = (pkg.license as string).toLowerCase();
    badges.push({
      name: "license",
      markdown: `[![License: ${pkg.license}](https://img.shields.io/badge/license-${encodeURIComponent(license)}-blue.svg)](LICENSE)`,
    });
  }

  // TypeScript badge
  if (await fileExists(`${repoDir}/tsconfig.json`)) {
    badges.push({
      name: "TypeScript",
      markdown: `![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)`,
    });
  }

  return badges;
}

async function updateReadme(readmePath: string, badges: Badge[]): Promise<boolean> {
  const exists = await fileExists(readmePath);
  if (!exists) {
    console.error(`README not found at ${readmePath}`);
    return false;
  }

  const content = await Bun.file(readmePath).text();
  const badgeLine = badges.map((b) => b.markdown).join(" ");

  // Check if there's already a badge section
  const badgeMarkerStart = "<!-- badges-start -->";
  const badgeMarkerEnd = "<!-- badges-end -->";

  let updated: string;
  if (content.includes(badgeMarkerStart) && content.includes(badgeMarkerEnd)) {
    // Replace existing badge section
    const before = content.slice(0, content.indexOf(badgeMarkerStart));
    const after = content.slice(content.indexOf(badgeMarkerEnd) + badgeMarkerEnd.length);
    updated = `${before}${badgeMarkerStart}\n${badgeLine}\n${badgeMarkerEnd}${after}`;
  } else {
    // Insert after the first heading
    const lines = content.split("\n");
    const headingIdx = lines.findIndex((l) => l.startsWith("# "));
    if (headingIdx !== -1) {
      lines.splice(headingIdx + 1, 0, "", `${badgeMarkerStart}\n${badgeLine}\n${badgeMarkerEnd}`, "");
      updated = lines.join("\n");
    } else {
      // Prepend
      updated = `${badgeMarkerStart}\n${badgeLine}\n${badgeMarkerEnd}\n\n${content}`;
    }
  }

  await Bun.write(readmePath, updated);
  return true;
}

async function main() {
  const repoDir = filteredArgs[0]
    ? Bun.resolveSync(filteredArgs[0], process.cwd())
    : process.cwd();

  const badges = await detectBadges(repoDir);

  if (badges.length === 0) {
    console.error("No badges to generate — no CI, npm package, or license detected.");
    process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({
      count: badges.length,
      badges,
      combined: badges.map((b) => b.markdown).join(" "),
    }, null, 2));
    return;
  }

  const target = readmePath
    ? Bun.resolveSync(readmePath, process.cwd())
    : `${repoDir}/README.md`;

  const updated = await updateReadme(target, badges);
  if (updated) {
    console.log(`Updated badges in ${target}:`);
    for (const badge of badges) {
      console.log(`  - ${badge.name}`);
    }
  } else {
    console.log("Badge markdown (copy to your README):\n");
    console.log(badges.map((b) => b.markdown).join("\n"));
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
