const args = Bun.argv.slice(2);

const HELP = `
tag-create — Create annotated or lightweight tags with semver validation

Usage:
  bun run tools/tag-create.ts <tag-name> [ref] [options]

Arguments:
  <tag-name>  Tag name, should follow semver (e.g. v1.2.3)
  [ref]       Commit or branch to tag (default: HEAD)

Options:
  --lightweight       Create a lightweight tag instead of annotated
  --message <msg>     Tag message for annotated tags
  --json              Output as JSON instead of plain text
  --help              Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const lightweight = args.includes("--lightweight");
const messageIdx = args.indexOf("--message");
const message = messageIdx !== -1 && args[messageIdx + 1] ? args[messageIdx + 1] : null;

const positional: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--message") { i++; continue; }
  if (args[i].startsWith("--")) continue;
  positional.push(args[i]);
}

const SEMVER_RE = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/;

interface TagResult {
  tag: string;
  ref: string;
  type: "annotated" | "lightweight";
  message: string | null;
  semverValid: boolean;
  warnings: string[];
  created: boolean;
}

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(stderr.trim() || `Command failed with exit code ${exitCode}`);
  }
  return text.trim();
}

async function main() {
  const tagName = positional[0];
  if (!tagName) { console.error("Error: tag name is required"); process.exit(1); }

  const ref = positional[1] || "HEAD";
  const warnings: string[] = [];
  const semverValid = SEMVER_RE.test(tagName);

  if (!semverValid) {
    warnings.push(`Tag "${tagName}" does not follow semver (expected v<major>.<minor>.<patch>)`);
  } else if (!tagName.startsWith("v")) {
    warnings.push(`Consider prefixing with "v" (e.g. v${tagName}) for consistency`);
  }

  // Check if tag already exists
  const existsProc = Bun.spawn(["git", "rev-parse", tagName], { stdout: "pipe", stderr: "pipe" });
  await new Response(existsProc.stdout).text();
  if ((await existsProc.exited) === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ tag: tagName, ref, type: lightweight ? "lightweight" : "annotated", message, semverValid, warnings: [`Tag "${tagName}" already exists`], created: false }, null, 2));
    } else {
      console.error(`Error: tag "${tagName}" already exists`);
      console.error(`  Use "git tag -d ${tagName}" to delete it first, or choose a different name`);
    }
    process.exit(1);
  }

  // Resolve ref
  let resolvedRef: string;
  try { resolvedRef = await run(["git", "rev-parse", "--verify", ref]); }
  catch { console.error(`Error: ref "${ref}" does not exist`); process.exit(1); return; }

  // Build and run git tag command
  const tagCmd = lightweight
    ? ["git", "tag", tagName, resolvedRef]
    : ["git", "tag", "-a", tagName, "-m", message || tagName, resolvedRef];

  try { await run(tagCmd); }
  catch (err: any) { console.error(`Error creating tag: ${err.message}`); process.exit(1); }

  const commitDate = await run(["git", "log", "-1", "--format=%ci", resolvedRef]);
  const commitSubject = await run(["git", "log", "-1", "--format=%s", resolvedRef]);
  const tagType = lightweight ? "lightweight" : "annotated";

  const result: TagResult = {
    tag: tagName, ref: resolvedRef.slice(0, 12), type: tagType,
    message: lightweight ? null : (message || tagName), semverValid, warnings, created: true,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created ${tagType} tag: ${tagName}`);
    console.log(`  Ref: ${result.ref}`);
    console.log(`  Date: ${commitDate}`);
    console.log(`  Commit: ${commitSubject}`);
    if (!lightweight && result.message) console.log(`  Message: ${result.message}`);
    for (const w of warnings) console.log(`  Warning: ${w}`);
    console.log(`\nTo push this tag: git push origin ${tagName}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
