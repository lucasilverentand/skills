#!/usr/bin/env bun
/**
 * devvars-check — scan for wrangler configs and report which workers are missing .dev.vars.
 *
 * For each wrangler config found, checks:
 *   - Whether .dev.vars exists
 *   - If .dev.vars.example exists, which variables from the example are absent in the actual file
 *
 * Usage: bun tools/devvars-check.ts [root-dir]
 */

import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { glob } from "bun"

const rootDir = process.argv[2] ?? process.cwd()

function parseVarNames(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
    .filter(Boolean)
}

const wranglerPatterns = ["**/wrangler.toml", "**/wrangler.json", "**/wrangler.jsonc"]

const configs: string[] = []
for (const pattern of wranglerPatterns) {
  for await (const match of glob(pattern, { cwd: rootDir, dot: true })) {
    // Skip node_modules
    if (match.includes("node_modules")) continue
    configs.push(join(rootDir, match))
  }
}

if (configs.length === 0) {
  console.log("No wrangler config files found.")
  process.exit(0)
}

type WorkerStatus = {
  config: string
  dir: string
  devvarsExists: boolean
  missingVars: string[]
}

const results: WorkerStatus[] = []

for (const configPath of configs) {
  const dir = dirname(configPath)
  const devvarsPath = join(dir, ".dev.vars")
  const examplePath = join(dir, ".dev.vars.example")

  const devvarsExists = existsSync(devvarsPath)
  let missingVars: string[] = []

  if (devvarsExists && existsSync(examplePath)) {
    const exampleContent = readFileSync(examplePath, "utf-8")
    const devvarsContent = readFileSync(devvarsPath, "utf-8")

    const expectedVars = parseVarNames(exampleContent)
    const actualVars = new Set(parseVarNames(devvarsContent))

    missingVars = expectedVars.filter((v) => !actualVars.has(v))
  } else if (!devvarsExists && existsSync(examplePath)) {
    // .dev.vars missing entirely — report all vars from example as missing
    const exampleContent = readFileSync(examplePath, "utf-8")
    missingVars = parseVarNames(exampleContent)
  }

  results.push({
    config: relative(rootDir, configPath),
    dir: relative(rootDir, dir) || ".",
    devvarsExists,
    missingVars,
  })
}

const ok = results.filter((r) => r.devvarsExists && r.missingVars.length === 0)
const missing = results.filter((r) => !r.devvarsExists)
const incomplete = results.filter((r) => r.devvarsExists && r.missingVars.length > 0)

console.log(`\nScanned ${results.length} worker(s) in ${rootDir}\n`)

if (ok.length > 0) {
  console.log(`✓ Complete (${ok.length}):`)
  for (const r of ok) {
    console.log(`  ${r.dir}`)
  }
  console.log()
}

if (incomplete.length > 0) {
  console.log(`⚠ Incomplete .dev.vars (${incomplete.length}):`)
  for (const r of incomplete) {
    console.log(`  ${r.dir}`)
    for (const v of r.missingVars) {
      console.log(`    missing: ${v}`)
    }
  }
  console.log()
}

if (missing.length > 0) {
  console.log(`✗ Missing .dev.vars (${missing.length}):`)
  for (const r of missing) {
    console.log(`  ${r.dir}  (config: ${r.config})`)
  }
  console.log()
}

if (missing.length > 0 || incomplete.length > 0) {
  console.log("Run `bun scripts/setup.ts` to generate missing .dev.vars files.")
  console.log(
    "Or copy the .dev.vars.example for each worker and fill in the missing values.\n"
  )
  process.exit(1)
} else {
  console.log("All workers have complete .dev.vars. ✓\n")
  process.exit(0)
}
