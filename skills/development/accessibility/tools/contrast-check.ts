const args = Bun.argv.slice(2);

const HELP = `
contrast-check — Extract color pairs from stylesheets and flag failing contrast ratios

Usage:
  bun run tools/contrast-check.ts <stylesheet-path> [options]

Options:
  --level aa    WCAG conformance level: aa (default) or aaa
  --json        Output as JSON instead of plain text
  --help        Show this help message

Parses CSS/SCSS/Tailwind files for foreground/background color declarations and
calculates contrast ratios against WCAG 2.1 thresholds.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const levelIdx = args.indexOf("--level");
const level = levelIdx !== -1 && args[levelIdx + 1] === "aaa" ? "aaa" : "aa";
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (levelIdx === -1 || i !== levelIdx + 1)
);

function hexToRgb(hex: string): [number, number, number] | null {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function namedColorToHex(name: string): string | null {
  const colors: Record<string, string> = {
    white: "#ffffff", black: "#000000", red: "#ff0000", green: "#008000",
    blue: "#0000ff", yellow: "#ffff00", gray: "#808080", grey: "#808080",
    orange: "#ffa500", purple: "#800080", navy: "#000080", teal: "#008080",
    silver: "#c0c0c0", maroon: "#800000", olive: "#808000", aqua: "#00ffff",
    fuchsia: "#ff00ff", lime: "#00ff00",
  };
  return colors[name.toLowerCase()] ?? null;
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColor(value: string): [number, number, number] | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#")) return hexToRgb(trimmed);

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  const hex = namedColorToHex(trimmed);
  if (hex) return hexToRgb(hex);

  return null;
}

interface ColorPair {
  file: string;
  line: number;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  pass: boolean;
  context: string;
}

async function scanFile(filePath: string): Promise<ColorPair[]> {
  const pairs: ColorPair[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return pairs;

  const content = await file.text();
  const lines = content.split("\n");

  // Find CSS rule blocks and extract color + background-color pairs
  const blockRegex = /([^{}]+)\{([^{}]+)\}/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = blockRegex.exec(content)) !== null) {
    const selector = blockMatch[1].trim();
    const body = blockMatch[2];
    const blockStart = content.substring(0, blockMatch.index).split("\n").length;

    const colorMatch = body.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/i);
    const bgMatch = body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;!]+)/i);

    if (colorMatch && bgMatch) {
      const fgColor = parseColor(colorMatch[1]);
      const bgColor = parseColor(bgMatch[1]);

      if (fgColor && bgColor) {
        const ratio = contrastRatio(fgColor, bgColor);
        const normalTextMin = level === "aaa" ? 7 : 4.5;
        pairs.push({
          file: filePath,
          line: blockStart,
          foreground: colorMatch[1].trim(),
          background: bgMatch[1].trim(),
          ratio: Math.round(ratio * 100) / 100,
          required: normalTextMin,
          pass: ratio >= normalTextMin,
          context: selector.length > 80 ? selector.substring(0, 80) + "..." : selector,
        });
      }
    }
  }

  // Also check inline styles in JSX/HTML
  const inlineRegex = /style\s*=\s*(?:\{\{|["'])([^}"']+)/g;
  let inlineMatch: RegExpExecArray | null;

  while ((inlineMatch = inlineRegex.exec(content)) !== null) {
    const styleStr = inlineMatch[1];
    const lineNum = content.substring(0, inlineMatch.index).split("\n").length;

    const colorMatch = styleStr.match(/color\s*:\s*["']?([^;,"']+)/i);
    const bgMatch = styleStr.match(/background(?:Color)?\s*:\s*["']?([^;,"']+)/i);

    if (colorMatch && bgMatch) {
      const fgColor = parseColor(colorMatch[1]);
      const bgColor = parseColor(bgMatch[1]);

      if (fgColor && bgColor) {
        const ratio = contrastRatio(fgColor, bgColor);
        const normalTextMin = level === "aaa" ? 7 : 4.5;
        pairs.push({
          file: filePath,
          line: lineNum,
          foreground: colorMatch[1].trim(),
          background: bgMatch[1].trim(),
          ratio: Math.round(ratio * 100) / 100,
          required: normalTextMin,
          pass: ratio >= normalTextMin,
          context: lines[lineNum - 1]?.trim().substring(0, 80) ?? "",
        });
      }
    }
  }

  return pairs;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{css,scss,less,jsx,tsx,html,svelte,vue}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required stylesheet path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No stylesheet or component files found at the specified path");
    process.exit(1);
  }

  const allPairs: ColorPair[] = [];
  for (const file of files) {
    const pairs = await scanFile(file);
    allPairs.push(...pairs);
  }

  const failing = allPairs.filter((p) => !p.pass);
  const passing = allPairs.filter((p) => p.pass);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          level,
          total: allPairs.length,
          passing: passing.length,
          failing: failing.length,
          pairs: allPairs,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Contrast Check (WCAG ${level.toUpperCase()}): ${files.length} files scanned`);
    console.log(`  ${allPairs.length} color pairs found — ${passing.length} pass, ${failing.length} fail\n`);

    if (failing.length === 0) {
      console.log("All color pairs meet the required contrast ratio.");
    } else {
      console.log("Failing pairs:\n");
      for (const p of failing) {
        console.log(
          `  ${p.file}:${p.line} — ratio ${p.ratio}:1 (need ${p.required}:1)`
        );
        console.log(`    fg: ${p.foreground}  bg: ${p.background}`);
        console.log(`    context: ${p.context}\n`);
      }
    }
  }

  if (failing.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
