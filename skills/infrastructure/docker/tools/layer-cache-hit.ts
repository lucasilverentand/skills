const args = Bun.argv.slice(2);

const HELP = `
layer-cache-hit — Estimate cache hit rate for each build stage by analyzing instruction volatility

Usage:
  bun run tools/layer-cache-hit.ts [path] [options]

Arguments:
  [path]  Path to Dockerfile (default: ./Dockerfile)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const dockerfilePath = filteredArgs[0] || "Dockerfile";

interface LayerAnalysis {
  line: number;
  instruction: string;
  content: string;
  volatility: "low" | "medium" | "high";
  reason: string;
}

interface StageAnalysis {
  name: string;
  layers: LayerAnalysis[];
  estimatedCacheRate: string;
  suggestions: string[];
}

// Files that change infrequently
const STABLE_FILES = ["package.json", "bun.lockb", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.toml", "Cargo.lock", "go.mod", "go.sum"];

async function main() {
  const file = Bun.file(dockerfilePath);
  if (!(await file.exists())) {
    console.error(`Error: file not found: ${dockerfilePath}`);
    process.exit(1);
  }

  const content = await file.text();
  const lines = content.split("\n");

  const stages: StageAnalysis[] = [];
  let currentStage: StageAnalysis = { name: "default", layers: [], estimatedCacheRate: "0%", suggestions: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    if (!line || line.startsWith("#")) continue;

    // Detect new stage
    if (line.startsWith("FROM ")) {
      if (currentStage.layers.length > 0) {
        stages.push(currentStage);
      }
      const asMatch = line.match(/\s+[Aa][Ss]\s+(\S+)/);
      currentStage = {
        name: asMatch ? asMatch[1] : `stage-${stages.length}`,
        layers: [],
        estimatedCacheRate: "0%",
        suggestions: [],
      };
      continue;
    }

    // Only COPY, RUN, ADD create cacheable layers
    if (!line.startsWith("COPY ") && !line.startsWith("RUN ") && !line.startsWith("ADD ")) continue;

    const instruction = line.split(/\s+/)[0];
    let volatility: "low" | "medium" | "high" = "medium";
    let reason = "";

    if (instruction === "COPY") {
      const copyArgs = line.slice(5).trim();

      // Check if copying stable dependency files
      if (STABLE_FILES.some((f) => copyArgs.includes(f))) {
        volatility = "low";
        reason = "Dependency manifest files change infrequently";
      } else if (copyArgs.startsWith("--from=")) {
        volatility = "low";
        reason = "COPY from another stage — changes only when that stage changes";
      } else if (copyArgs === ". .") {
        volatility = "high";
        reason = "Copies entire context — invalidated by any source change";
      } else {
        volatility = "high";
        reason = "Source files change frequently";
      }
    } else if (instruction === "RUN") {
      const runCmd = line.slice(4).trim();

      if (runCmd.includes("install") && (runCmd.includes("bun") || runCmd.includes("npm") || runCmd.includes("yarn") || runCmd.includes("apt-get"))) {
        volatility = "low";
        reason = "Install step — cached as long as dependency files haven't changed";
      } else if (runCmd.includes("build") || runCmd.includes("compile") || runCmd.includes("tsc")) {
        volatility = "high";
        reason = "Build step — invalidated by source changes above";
      } else {
        volatility = "medium";
        reason = "General command — cache depends on context";
      }
    } else if (instruction === "ADD") {
      volatility = "high";
      reason = "ADD can fetch remote URLs and always invalidates cache for archives";
    }

    currentStage.layers.push({
      line: lineNum,
      instruction,
      content: line.slice(0, 100),
      volatility,
      reason,
    });
  }

  if (currentStage.layers.length > 0) {
    stages.push(currentStage);
  }

  // Calculate estimated cache rates and suggestions
  for (const stage of stages) {
    if (stage.layers.length === 0) continue;

    let cacheBreakIdx = stage.layers.length;
    for (let i = 0; i < stage.layers.length; i++) {
      if (stage.layers[i].volatility === "high") {
        cacheBreakIdx = i;
        break;
      }
    }

    const cacheableRatio = stage.layers.length > 0 ? cacheBreakIdx / stage.layers.length : 0;
    stage.estimatedCacheRate = `${Math.round(cacheableRatio * 100)}%`;

    // Check for ordering issues
    for (let i = 1; i < stage.layers.length; i++) {
      if (stage.layers[i].volatility === "low" && stage.layers[i - 1].volatility === "high") {
        stage.suggestions.push(
          `L${stage.layers[i].line}: Move "${stage.layers[i].content.slice(0, 50)}..." before high-volatility layers for better caching`
        );
      }
    }

    if (cacheBreakIdx === 0) {
      stage.suggestions.push("First layer is high-volatility — nothing will be cached. Move dependency installs before source copies.");
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(stages, null, 2));
  } else {
    for (const stage of stages) {
      console.log(`Stage: ${stage.name} (estimated cache rate: ${stage.estimatedCacheRate})\n`);

      for (const layer of stage.layers) {
        const icon = layer.volatility === "low" ? "CACHE" : layer.volatility === "medium" ? "MAYBE" : "MISS ";
        console.log(`  L${String(layer.line).padEnd(4)} [${icon}] ${layer.content}`);
        console.log(`  ${"".padEnd(6)} ${layer.reason}`);
      }

      if (stage.suggestions.length > 0) {
        console.log("\n  Suggestions:");
        for (const s of stage.suggestions) {
          console.log(`    - ${s}`);
        }
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
