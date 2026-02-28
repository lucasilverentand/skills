const args = Bun.argv.slice(2);

const HELP = `
stacktrace-parse — Parse and enrich stack traces with source context

Usage:
  bun run tools/stacktrace-parse.ts <trace-file-or-text> [options]

Options:
  --context <n>   Lines of source context around each frame (default: 3)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Parses a JavaScript/TypeScript stack trace, resolves file paths, reads
surrounding source lines for each frame, and highlights the first frame
belonging to project code (not node_modules or runtime internals).
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const contextIdx = args.indexOf("--context");
const contextLines = contextIdx !== -1 ? parseInt(args[contextIdx + 1]) || 3 : 3;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (contextIdx === -1 || i !== contextIdx + 1)
);

interface StackFrame {
  raw: string;
  functionName: string;
  file: string;
  line: number;
  column: number;
  isProjectCode: boolean;
  sourceContext: string[];
}

function parseFrame(rawLine: string): Omit<StackFrame, "sourceContext" | "isProjectCode"> | null {
  const trimmed = rawLine.trim();

  // Standard V8 format: at functionName (file:line:column)
  let match = trimmed.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
  if (match) {
    return {
      raw: trimmed,
      functionName: match[1],
      file: match[2],
      line: parseInt(match[3]),
      column: parseInt(match[4]),
    };
  }

  // Anonymous: at file:line:column
  match = trimmed.match(/at\s+(.+):(\d+):(\d+)/);
  if (match) {
    return {
      raw: trimmed,
      functionName: "<anonymous>",
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
    };
  }

  // Bun format: functionName @ file:line:column
  match = trimmed.match(/(.+?)\s+@\s+(.+):(\d+):(\d+)/);
  if (match) {
    return {
      raw: trimmed,
      functionName: match[1],
      file: match[2],
      line: parseInt(match[3]),
      column: parseInt(match[4]),
    };
  }

  // Safari/Firefox format: functionName@file:line:column
  match = trimmed.match(/^([^@]*)@(.+):(\d+):(\d+)/);
  if (match) {
    return {
      raw: trimmed,
      functionName: match[1] || "<anonymous>",
      file: match[2],
      line: parseInt(match[3]),
      column: parseInt(match[4]),
    };
  }

  return null;
}

function isProjectFile(filePath: string): boolean {
  if (filePath.includes("node_modules")) return false;
  if (filePath.startsWith("node:") || filePath.startsWith("internal/")) return false;
  if (filePath.includes("bun:")) return false;
  if (filePath.startsWith("<")) return false;
  return true;
}

async function getSourceContext(
  filePath: string,
  lineNum: number,
  contextSize: number
): Promise<string[]> {
  try {
    const file = Bun.file(filePath);
    if (!(await file.exists())) return [];

    const content = await file.text();
    const lines = content.split("\n");

    const start = Math.max(0, lineNum - contextSize - 1);
    const end = Math.min(lines.length, lineNum + contextSize);

    const result: string[] = [];
    for (let i = start; i < end; i++) {
      const marker = i === lineNum - 1 ? ">>>" : "   ";
      result.push(`${marker} ${String(i + 1).padStart(4)} | ${lines[i]}`);
    }

    return result;
  } catch {
    return [];
  }
}

async function main() {
  const input = filteredArgs[0];
  if (!input) {
    console.error("Error: missing stack trace input (file path or trace text)");
    process.exit(1);
  }

  let traceText: string;

  // Check if input is a file
  const file = Bun.file(input);
  if (await file.exists()) {
    traceText = await file.text();
  } else {
    // Treat as inline trace text (join remaining args)
    traceText = filteredArgs.join(" ");
  }

  const traceLines = traceText.split("\n");

  // Extract error message (first line usually)
  let errorMessage = "";
  const frames: StackFrame[] = [];

  for (const line of traceLines) {
    const parsed = parseFrame(line);
    if (parsed) {
      const isProject = isProjectFile(parsed.file);
      const sourceContext = await getSourceContext(parsed.file, parsed.line, contextLines);
      frames.push({
        ...parsed,
        isProjectCode: isProject,
        sourceContext,
      });
    } else if (frames.length === 0 && line.trim()) {
      errorMessage += (errorMessage ? "\n" : "") + line.trim();
    }
  }

  const firstProjectFrame = frames.find((f) => f.isProjectCode);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          errorMessage,
          totalFrames: frames.length,
          projectFrames: frames.filter((f) => f.isProjectCode).length,
          firstProjectFrame: firstProjectFrame
            ? {
                file: firstProjectFrame.file,
                line: firstProjectFrame.line,
                column: firstProjectFrame.column,
                functionName: firstProjectFrame.functionName,
              }
            : null,
          frames,
        },
        null,
        2
      )
    );
  } else {
    if (errorMessage) {
      console.log(`Error: ${errorMessage}\n`);
    }

    console.log(`Stack trace: ${frames.length} frames (${frames.filter((f) => f.isProjectCode).length} in project code)\n`);

    if (firstProjectFrame) {
      console.log(
        `Root cause likely at: ${firstProjectFrame.file}:${firstProjectFrame.line}:${firstProjectFrame.column}`
      );
      console.log(`  in ${firstProjectFrame.functionName}\n`);

      if (firstProjectFrame.sourceContext.length > 0) {
        console.log("Source context:");
        for (const line of firstProjectFrame.sourceContext) {
          console.log(`  ${line}`);
        }
        console.log();
      }
    }

    console.log("Full trace:\n");
    for (const frame of frames) {
      const marker = frame === firstProjectFrame ? ">>>" : frame.isProjectCode ? " * " : "   ";
      console.log(
        `${marker} ${frame.functionName} (${frame.file}:${frame.line}:${frame.column})`
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
