import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

type RelatedEntry = {
  target: string;
  line: number;
};

type ValidationError = {
  file: string;
  line: number;
  message: string;
};

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules"]);
const args = Bun.argv.slice(2);
const targets = args.length > 0 ? args : ["."];
const errors: ValidationError[] = [];

const markdownFiles = await collectMarkdownFiles(targets);

for (const file of markdownFiles) {
  const content = await readFile(file, "utf8");
  errors.push(...validateRelatedEntries(file, content));
  errors.push(...validateMarkdownLinks(file, content));
}

if (errors.length > 0) {
  console.error("Broken document references found:");

  for (const error of errors) {
    console.error(
      `- ${path.relative(root, error.file)}:${error.line}: ${error.message}`
    );
  }

  process.exit(1);
}

console.log(`Validated references in ${markdownFiles.length} markdown files.`);

async function collectMarkdownFiles(inputPaths: string[]): Promise<string[]> {
  const files = new Set<string>();

  for (const inputPath of inputPaths) {
    const absolutePath = path.resolve(root, inputPath);

    if (!existsSync(absolutePath)) {
      errors.push({
        file: absolutePath,
        line: 1,
        message: "configured validation path does not exist",
      });
      continue;
    }

    await collectPath(absolutePath, files);
  }

  return [...files].sort();
}

async function collectPath(inputPath: string, files: Set<string>) {
  const inputStat = await stat(inputPath);

  if (inputStat.isDirectory()) {
    const basename = path.basename(inputPath);

    if (ignoredDirs.has(basename)) {
      return;
    }

    const entries = await readdir(inputPath);

    for (const entry of entries) {
      await collectPath(path.join(inputPath, entry), files);
    }

    return;
  }

  if (inputStat.isFile() && inputPath.endsWith(".md")) {
    files.add(inputPath);
  }
}

function validateRelatedEntries(
  file: string,
  content: string
): ValidationError[] {
  const frontmatter = readFrontmatter(content);

  if (!frontmatter) {
    return [];
  }

  return parseRelated(frontmatter.text, frontmatter.startLine).flatMap(
    (entry) => validateLocalTarget(file, entry.target, entry.line, "related")
  );
}

function validateMarkdownLinks(
  file: string,
  content: string
): ValidationError[] {
  const stripped = stripIgnoredMarkdown(content);
  const linkRegex = /(?<!!)\[[^\]\n]+\]\(([^)\n]+)\)/g;
  const errors: ValidationError[] = [];

  for (const match of stripped.matchAll(linkRegex)) {
    const rawDestination = match[1];
    const destination = parseMarkdownDestination(rawDestination);

    if (!destination || shouldSkipMarkdownTarget(destination)) {
      continue;
    }

    errors.push(
      ...validateLocalTarget(
        file,
        destination,
        lineNumberForIndex(stripped, match.index ?? 0),
        "markdown link"
      )
    );
  }

  return errors;
}

function readFrontmatter(
  content: string
): { text: string; startLine: number } | null {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const endIndex = content.indexOf("\n---", 4);

  if (endIndex === -1) {
    return null;
  }

  return {
    text: content.slice(4, endIndex),
    startLine: 2,
  };
}

function parseRelated(frontmatter: string, startLine: number): RelatedEntry[] {
  const lines = frontmatter.split("\n");
  const entries: RelatedEntry[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const relatedMatch = line.match(/^related:\s*(.*)$/);

    if (!relatedMatch) {
      continue;
    }

    const inlineValue = relatedMatch[1].trim();
    const lineNumber = startLine + index;

    if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
      for (const target of inlineValue.slice(1, -1).split(",")) {
        const cleaned = cleanYamlScalar(target);

        if (cleaned) {
          entries.push({ target: cleaned, line: lineNumber });
        }
      }

      continue;
    }

    if (inlineValue) {
      const cleaned = cleanYamlScalar(inlineValue);

      if (cleaned) {
        entries.push({ target: cleaned, line: lineNumber });
      }

      continue;
    }

    for (
      let blockIndex = index + 1;
      blockIndex < lines.length;
      blockIndex += 1
    ) {
      const blockLine = lines[blockIndex];

      if (blockLine.trim() === "") {
        continue;
      }

      if (!/^\s+/.test(blockLine)) {
        break;
      }

      const listMatch = blockLine.match(/^\s*-\s*(.*)$/);

      if (!listMatch) {
        continue;
      }

      const listValue = listMatch[1].trim();
      const objectValueMatch = listValue.match(/^(?:file|path|href):\s*(.*)$/);
      const target = cleanYamlScalar(objectValueMatch?.[1] ?? listValue);

      if (target) {
        entries.push({ target, line: startLine + blockIndex });
      }
    }
  }

  return entries;
}

function validateLocalTarget(
  sourceFile: string,
  rawTarget: string,
  line: number,
  label: string
): ValidationError[] {
  const target = rawTarget.trim();

  if (!target || target.startsWith("#")) {
    return [];
  }

  if (isExternalTarget(target)) {
    return [
      {
        file: sourceFile,
        line,
        message: `${label} must be repo-local: ${target}`,
      },
    ];
  }

  const pathWithoutFragment = target.split("#", 1)[0];

  if (!pathWithoutFragment) {
    return [];
  }

  const resolvedPath = path.isAbsolute(pathWithoutFragment)
    ? path.join(root, pathWithoutFragment)
    : path.resolve(path.dirname(sourceFile), pathWithoutFragment);

  if (existsSync(resolvedPath)) {
    return [];
  }

  return [
    {
      file: sourceFile,
      line,
      message: `${label} target does not exist: ${target}`,
    },
  ];
}

function shouldSkipMarkdownTarget(destination: string): boolean {
  if (
    destination.startsWith("#") ||
    isExternalTarget(destination) ||
    destination.startsWith("//")
  ) {
    return true;
  }

  return path.extname(destination.split("#", 1)[0]) !== ".md";
}

function isExternalTarget(target: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(target);
}

function parseMarkdownDestination(rawDestination: string): string | null {
  const trimmed = rawDestination.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("<")) {
    const end = trimmed.indexOf(">");
    return end === -1 ? null : trimmed.slice(1, end);
  }

  return trimmed.split(/\s+/, 1)[0];
}

function stripIgnoredMarkdown(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, (match) => "\n".repeat(countLines(match) - 1))
    .replace(/```[\s\S]*?```/g, (match) => "\n".repeat(countLines(match) - 1));
}

function cleanYamlScalar(value: string): string {
  return value
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function lineNumberForIndex(content: string, index: number): number {
  return countLines(content.slice(0, index));
}

function countLines(value: string): number {
  return value.split("\n").length;
}
