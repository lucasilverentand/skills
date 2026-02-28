const args = Bun.argv.slice(2);

const HELP = `
result-type-gen — Generate Result type helpers and error code enums for a module

Usage:
  bun run tools/result-type-gen.ts <module-name> [options]

Options:
  --out <dir>   Output directory (default: src/modules/<module-name>)
  --errors      Comma-separated error codes to include (e.g., NOT_FOUND,ALREADY_EXISTS,INVALID_INPUT)
  --json        Output generated code as JSON instead of writing files
  --help        Show this help message

Generates:
  - result.ts   — Result<T, E> type, ok(), err() helpers (shared, written once)
  - errors.ts   — Module-specific error code constants and typed error factory

Examples:
  bun run tools/result-type-gen.ts auth --errors INVALID_TOKEN,EXPIRED_SESSION,INSUFFICIENT_SCOPE
  bun run tools/result-type-gen.ts payment --out src/services/payment --errors DECLINED,INSUFFICIENT_FUNDS
  bun run tools/result-type-gen.ts user --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const moduleName = filteredArgs[0];
if (!moduleName) {
  console.error("Error: missing required module-name argument");
  process.exit(1);
}

const outDir = getFlag("--out") || `src/modules/${moduleName}`;
const rawErrors = getFlag("--errors");
const errorCodes = rawErrors
  ? rawErrors.split(",").map((e) => e.trim().toUpperCase())
  : ["NOT_FOUND", "ALREADY_EXISTS", "INVALID_INPUT"];

const domainPrefix = moduleName.toUpperCase().replace(/-/g, "_");

// Shared result.ts — only needs to exist once in the project
const resultFile = `/**
 * Shared result type for error handling.
 * Place this file at src/lib/result.ts and import from there.
 */

export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  constraint?: string;
}

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Convert a Zod error into a structured AppError with field-level details.
 */
export function fromZodError(zodError: { issues: Array<{ path: (string | number)[]; message: string; code: string }> }): AppError {
  return {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details: zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      constraint: issue.code,
    })),
  };
}
`;

// Module-specific errors.ts
const pascalModule =
  moduleName.charAt(0).toUpperCase() +
  moduleName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const errorEntries = errorCodes
  .map((code) => {
    const fullCode = `${domainPrefix}_${code}`;
    return `  ${code}: "${fullCode}"`;
  })
  .join(",\n");

const factoryArms = errorCodes
  .map((code) => {
    const fullCode = `${domainPrefix}_${code}`;
    const readableCode = code
      .toLowerCase()
      .replace(/_/g, " ");
    return `    case ${pascalModule}Errors.${code}:
      return err({ code: "${fullCode}", message: message ?? "${readableCode}", ...cause ? { cause } : {} });`;
  })
  .join("\n");

const errorsFile = `import { err, type AppError, type Result } from "../lib/result";

/**
 * Error codes for the ${moduleName} module.
 * All codes are prefixed with ${domainPrefix}_ for domain clarity.
 */
export const ${pascalModule}Errors = {
${errorEntries},
} as const;

export type ${pascalModule}ErrorCode = (typeof ${pascalModule}Errors)[keyof typeof ${pascalModule}Errors];

/**
 * Create a typed error result for the ${moduleName} module.
 */
export function ${moduleName.replace(/-/g, "")}Error(
  code: keyof typeof ${pascalModule}Errors,
  message?: string,
  cause?: unknown
): Result<never, AppError> {
  switch (code) {
${factoryArms}
    default:
      return err({ code: \`${domainPrefix}_UNKNOWN\`, message: message ?? "Unknown ${moduleName} error" });
  }
}
`;

interface GeneratedFile {
  path: string;
  content: string;
  description: string;
}

const files: GeneratedFile[] = [
  {
    path: "src/lib/result.ts",
    content: resultFile,
    description: "Shared Result<T, E> type, ok(), err() helpers, and fromZodError converter",
  },
  {
    path: `${outDir}/errors.ts`,
    content: errorsFile,
    description: `Error codes and typed error factory for the ${moduleName} module`,
  },
];

async function main() {
  if (jsonOutput) {
    console.log(JSON.stringify({ module: moduleName, files }, null, 2));
    return;
  }

  const { existsSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { dirname, resolve } = await import("node:path");

  for (const file of files) {
    const fullPath = resolve(file.path);
    const dir = dirname(fullPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (existsSync(fullPath) && file.path === "src/lib/result.ts") {
      console.log(`SKIP ${fullPath} (already exists — shared file)`);
      continue;
    }

    writeFileSync(fullPath, file.content);
    console.log(`WRITE ${fullPath}`);
    console.log(`  ${file.description}\n`);
  }

  console.log(`\nGenerated ${moduleName} error handling files.`);
  console.log(`\nNext steps:`);
  console.log(`  1. Import { ok, err } from "src/lib/result" in your ${moduleName} service`);
  console.log(`  2. Import { ${moduleName.replace(/-/g, "")}Error, ${pascalModule}Errors } from "${outDir}/errors" for domain errors`);
  console.log(`  3. Return result types from all ${moduleName} functions`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
