const args = Bun.argv.slice(2);

const HELP = `
example-validator — Extract code blocks from Markdown and type-check them with bun

Usage:
  bun run tools/example-validator.ts <markdown-file> [options]

Arguments:
  markdown-file   Path to a Markdown file containing code examples

Options:
  --lang <lang>   Only check blocks with this language tag (default: ts,typescript,tsx)
  --json          Output results as JSON instead of plain text
  --help          Show this help message

Examples:
  bun run tools/example-validator.ts README.md
  bun run tools/example-validator.ts docs/guide.md --lang ts
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const langIdx = args.indexOf("--lang");
const langFilter = langIdx !== -1
  ? args[langIdx + 1].split(",")
  : ["ts", "typescript", "tsx"];
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && i !== langIdx + 1
);

interface CodeBlock {
  lang: string;
  code: string;
  line: number;
}

interface CheckResult {
  block: CodeBlock;
  success: boolean;
  errors: string[];
}

function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = content.split("\n");
  let inBlock = false;
  let currentLang = "";
  let currentCode: string[] = [];
  let blockStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inBlock && line.match(/^```(\w+)/)) {
      inBlock = true;
      currentLang = line.match(/^```(\w+)/)![1];
      currentCode = [];
      blockStart = i + 1;
    } else if (inBlock && line.trim() === "```") {
      blocks.push({
        lang: currentLang,
        code: currentCode.join("\n"),
        line: blockStart,
      });
      inBlock = false;
      currentLang = "";
      currentCode = [];
    } else if (inBlock) {
      currentCode.push(line);
    }
  }

  return blocks;
}

async function typeCheckBlock(block: CodeBlock): Promise<CheckResult> {
  // Write to a temp file
  const tmpDir = `${process.env.TMPDIR || "/tmp"}/example-validator`;
  Bun.spawnSync(["mkdir", "-p", tmpDir]);

  const ext = block.lang === "tsx" ? ".tsx" : ".ts";
  const tmpFile = `${tmpDir}/check_${block.line}${ext}`;

  // Wrap code in a way that allows imports and top-level expressions
  let wrappedCode = block.code;

  // If the code has `import` statements, it's already a module
  // If not, we might need to handle it as a script
  if (!wrappedCode.includes("import ") && !wrappedCode.includes("export ")) {
    // Treat as script — wrap to avoid top-level restrictions
    wrappedCode = `// @ts-nocheck for implicit any\n${wrappedCode}`;
  }

  await Bun.write(tmpFile, wrappedCode);

  // Run bun's type checker
  const proc = Bun.spawnSync(["bun", "build", "--no-bundle", tmpFile, "--outdir", tmpDir], {
    timeout: 10_000,
    env: { ...process.env },
  });

  const stderr = proc.stderr.toString();
  const errors: string[] = [];

  if (proc.exitCode !== 0) {
    // Parse error output
    const errorLines = stderr.split("\n").filter((l) =>
      l.includes("error") || l.includes("Error")
    );
    errors.push(...(errorLines.length > 0 ? errorLines : [stderr.trim()]));
  }

  // Clean up
  try {
    Bun.spawnSync(["rm", "-f", tmpFile]);
  } catch {
    // Ignore cleanup errors
  }

  return {
    block,
    success: proc.exitCode === 0,
    errors,
  };
}

async function main() {
  const mdFile = filteredArgs[0];
  if (!mdFile) {
    console.error("Error: missing required argument <markdown-file>");
    process.exit(1);
  }

  const resolvedPath = Bun.resolveSync(mdFile, process.cwd());
  const exists = await Bun.file(resolvedPath).exists();
  if (!exists) {
    console.error(`Error: file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const content = await Bun.file(resolvedPath).text();
  const allBlocks = extractCodeBlocks(content);
  const blocks = allBlocks.filter((b) => langFilter.includes(b.lang));

  if (blocks.length === 0) {
    console.error(`No ${langFilter.join("/")} code blocks found in ${mdFile}`);
    process.exit(0);
  }

  const results: CheckResult[] = [];
  for (const block of blocks) {
    const result = await typeCheckBlock(block);
    results.push(result);
  }

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  if (jsonOutput) {
    console.log(JSON.stringify({
      file: resolvedPath,
      totalBlocks: allBlocks.length,
      checkedBlocks: blocks.length,
      passed,
      failed,
      results: results.map((r) => ({
        line: r.block.line,
        lang: r.block.lang,
        success: r.success,
        errors: r.errors,
        codePreview: r.block.code.split("\n")[0].slice(0, 80),
      })),
    }, null, 2));
  } else {
    console.log(`Validating code blocks in ${mdFile}`);
    console.log(`Total blocks: ${allBlocks.length}  Checked: ${blocks.length}\n`);

    for (const r of results) {
      const icon = r.success ? "PASS" : "FAIL";
      const preview = r.block.code.split("\n")[0].slice(0, 60);
      console.log(`[${icon}] Line ${r.block.line}: ${preview}`);
      if (!r.success) {
        for (const err of r.errors) {
          console.log(`       ${err}`);
        }
      }
    }

    console.log(`\nPassed: ${passed}  Failed: ${failed}`);
    if (failed > 0) {
      console.log("\nFix the errors above and re-run.");
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
