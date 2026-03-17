const args = Bun.argv.slice(2);

const HELP = `
rate-limit-check — Probe API endpoints and summarize rate limit headers

Usage:
  bun run tools/rate-limit-check.ts <endpoint-url> [options]

Options:
  --method <METHOD>  HTTP method to use (default: GET)
  --header <H>       Add a header (repeatable, format: "Key: Value")
  --json             Output as JSON instead of plain text
  --help             Show this help message

Sends a request to the endpoint and inspects response headers for
rate limit information (X-RateLimit-*, RateLimit-*, Retry-After, etc.).
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

// Parse arguments
let method = "GET";
const headers: Record<string, string> = {};
const positional: string[] = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--method" && args[i + 1]) {
    method = args[i + 1].toUpperCase();
    i++;
  } else if (args[i] === "--header" && args[i + 1]) {
    const [key, ...rest] = args[i + 1].split(":");
    headers[key.trim()] = rest.join(":").trim();
    i++;
  } else if (!args[i].startsWith("--")) {
    positional.push(args[i]);
  }
}

const RATE_LIMIT_HEADERS = [
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
  "x-ratelimit-used",
  "x-ratelimit-resource",
  "x-ratelimit-retry-after",
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "ratelimit-policy",
  "retry-after",
  "x-rate-limit-limit",
  "x-rate-limit-remaining",
  "x-rate-limit-reset",
];

async function main() {
  const url = positional[0];
  if (!url) {
    console.error("Error: missing required endpoint URL");
    process.exit(1);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers });
  } catch (err: any) {
    console.error(`Error: failed to reach ${url} — ${err.message}`);
    process.exit(1);
  }

  // Collect rate limit headers
  const found: Record<string, string> = {};
  const allHeaders: Record<string, string> = {};

  res.headers.forEach((value, key) => {
    allHeaders[key.toLowerCase()] = value;
    if (RATE_LIMIT_HEADERS.includes(key.toLowerCase())) {
      found[key.toLowerCase()] = value;
    }
  });

  // Also check for any header containing "rate" or "limit" or "throttl" or "quota"
  const extraRateHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      (lower.includes("rate") || lower.includes("limit") || lower.includes("throttl") || lower.includes("quota")) &&
      !found[lower]
    ) {
      extraRateHeaders[lower] = value;
    }
  });

  const result = {
    url,
    method,
    statusCode: res.status,
    statusText: res.statusText,
    rateLimitHeaders: found,
    additionalRateHeaders: extraRateHeaders,
    hasRateLimitInfo: Object.keys(found).length > 0 || Object.keys(extraRateHeaders).length > 0,
  };

  // Parse reset time if present
  let resetInfo = "";
  const resetValue =
    found["x-ratelimit-reset"] ??
    found["ratelimit-reset"] ??
    found["x-rate-limit-reset"];
  if (resetValue) {
    const resetNum = Number(resetValue);
    if (resetNum > 1_000_000_000) {
      // Unix timestamp
      const resetDate = new Date(resetNum * 1000);
      const secondsUntilReset = Math.max(0, Math.floor((resetDate.getTime() - Date.now()) / 1000));
      resetInfo = `Resets at ${resetDate.toISOString()} (${secondsUntilReset}s from now)`;
    } else {
      resetInfo = `Resets in ${resetValue} seconds`;
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ ...result, resetInfo }, null, 2));
    return;
  }

  // Human-readable output
  console.log(`# Rate Limit Check: ${url}\n`);
  console.log(`Method: ${method}`);
  console.log(`Status: ${res.status} ${res.statusText}\n`);

  if (!result.hasRateLimitInfo) {
    console.log("No rate limit headers found in response.");
    console.log(
      "This endpoint may not expose rate limit info via headers, or may not rate-limit this request type."
    );
    console.log("\nAll response headers:");
    for (const [key, value] of Object.entries(allHeaders)) {
      console.log(`  ${key}: ${value}`);
    }
    return;
  }

  if (Object.keys(found).length > 0) {
    console.log("## Standard Rate Limit Headers\n");
    for (const [key, value] of Object.entries(found)) {
      console.log(`  ${key}: ${value}`);
    }
  }

  if (Object.keys(extraRateHeaders).length > 0) {
    console.log("\n## Additional Rate-Related Headers\n");
    for (const [key, value] of Object.entries(extraRateHeaders)) {
      console.log(`  ${key}: ${value}`);
    }
  }

  if (resetInfo) {
    console.log(`\n## Reset\n\n  ${resetInfo}`);
  }

  // Summary
  const limit = found["x-ratelimit-limit"] ?? found["ratelimit-limit"] ?? found["x-rate-limit-limit"];
  const remaining = found["x-ratelimit-remaining"] ?? found["ratelimit-remaining"] ?? found["x-rate-limit-remaining"];

  if (limit && remaining) {
    const used = Number(limit) - Number(remaining);
    const pct = ((used / Number(limit)) * 100).toFixed(1);
    console.log(`\n## Usage Summary\n`);
    console.log(`  Limit: ${limit} requests`);
    console.log(`  Used: ${used} (${pct}%)`);
    console.log(`  Remaining: ${remaining}`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
