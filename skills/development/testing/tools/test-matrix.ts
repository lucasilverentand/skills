const args = Bun.argv.slice(2);

const HELP = `
test-matrix — Generate a test case matrix from input parameter combinations

Usage:
  bun run tools/test-matrix.ts <config-file> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads a test matrix configuration (JSON or inline) and generates all
combinations of parameters for exhaustive testing.

Config format (JSON file):
  {
    "parameters": {
      "role": ["admin", "user", "guest"],
      "method": ["GET", "POST"],
      "auth": [true, false]
    },
    "exclude": [
      { "role": "guest", "method": "POST" }
    ]
  }

Or inline: bun run tools/test-matrix.ts '{"role":["a","b"],"method":["GET","POST"]}'
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface MatrixConfig {
  parameters: Record<string, (string | number | boolean)[]>;
  exclude?: Record<string, string | number | boolean>[];
}

type TestCase = Record<string, string | number | boolean>;

function generateCombinations(params: Record<string, (string | number | boolean)[]>): TestCase[] {
  const keys = Object.keys(params);
  if (keys.length === 0) return [{}];

  const [firstKey, ...restKeys] = keys;
  const restParams: Record<string, (string | number | boolean)[]> = {};
  for (const k of restKeys) {
    restParams[k] = params[k];
  }

  const restCombinations = generateCombinations(restParams);
  const result: TestCase[] = [];

  for (const value of params[firstKey]) {
    for (const rest of restCombinations) {
      result.push({ [firstKey]: value, ...rest });
    }
  }

  return result;
}

function matchesExclusion(
  testCase: TestCase,
  exclusion: Record<string, string | number | boolean>
): boolean {
  for (const [key, value] of Object.entries(exclusion)) {
    if (testCase[key] !== value) return false;
  }
  return true;
}

async function main() {
  const input = filteredArgs[0];
  if (!input) {
    console.error("Error: config file or inline JSON required");
    process.exit(1);
  }

  let config: MatrixConfig;

  // Try as file first, then as inline JSON
  const file = Bun.file(input);
  if (await file.exists()) {
    const raw = await file.json();
    config = raw.parameters ? raw : { parameters: raw };
  } else {
    try {
      const raw = JSON.parse(input);
      config = raw.parameters ? raw : { parameters: raw };
    } catch {
      console.error("Error: input is not a valid JSON file or inline JSON");
      process.exit(1);
    }
  }

  const allCombinations = generateCombinations(config.parameters);

  // Apply exclusions
  const exclusions = config.exclude || [];
  const filtered = allCombinations.filter(
    (tc) => !exclusions.some((ex) => matchesExclusion(tc, ex))
  );

  const paramKeys = Object.keys(config.parameters);
  const totalPossible = allCombinations.length;
  const excluded = totalPossible - filtered.length;

  const result = {
    parameters: Object.fromEntries(
      Object.entries(config.parameters).map(([k, v]) => [k, v.length])
    ),
    totalCombinations: totalPossible,
    excluded,
    testCases: filtered.length,
    matrix: filtered,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Test Matrix: ${filtered.length} cases (${excluded} excluded from ${totalPossible} total)\n`);
    console.log("Parameters:");
    for (const [key, values] of Object.entries(config.parameters)) {
      console.log(`  ${key}: ${(values as (string | number | boolean)[]).join(", ")}`);
    }
    console.log();

    // Print as table
    const header = paramKeys.map((k) => k.padEnd(12)).join(" | ");
    console.log(`  ${header}`);
    console.log(`  ${"─".repeat(header.length)}`);

    for (const tc of filtered) {
      const row = paramKeys
        .map((k) => String(tc[k]).padEnd(12))
        .join(" | ");
      console.log(`  ${row}`);
    }

    if (exclusions.length > 0) {
      console.log(`\nExclusions (${exclusions.length}):`);
      for (const ex of exclusions) {
        console.log(
          `  ${Object.entries(ex).map(([k, v]) => `${k}=${v}`).join(", ")}`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
