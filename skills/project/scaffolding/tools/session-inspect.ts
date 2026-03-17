const args = Bun.argv.slice(2);

const HELP = `
session-inspect — Decode and display session token claims

Usage:
  bun run tools/session-inspect.ts <token> [options]

Arguments:
  token    The session token or JWT to inspect

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface TokenInfo {
  type: "jwt" | "opaque";
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  expired?: boolean;
  expiresAt?: string;
  issuedAt?: string;
  raw: string;
}

function base64UrlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

function tryParseJwt(token: string): TokenInfo | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp ? payload.exp < now : undefined;
    const expiresAt = payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : undefined;
    const issuedAt = payload.iat
      ? new Date(payload.iat * 1000).toISOString()
      : undefined;

    return {
      type: "jwt",
      header,
      payload,
      expired,
      expiresAt,
      issuedAt,
      raw: token,
    };
  } catch {
    return null;
  }
}

async function main() {
  const token = filteredArgs[0];
  if (!token) {
    console.error("Error: missing required token argument");
    process.exit(1);
  }

  // Try to parse as JWT
  const jwtInfo = tryParseJwt(token);

  if (jwtInfo) {
    if (jsonOutput) {
      console.log(JSON.stringify(jwtInfo, null, 2));
    } else {
      console.log("Token type: JWT\n");

      console.log("Header:");
      for (const [key, value] of Object.entries(jwtInfo.header || {})) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      }

      console.log("\nPayload:");
      for (const [key, value] of Object.entries(jwtInfo.payload || {})) {
        if (key === "exp" || key === "iat" || key === "nbf") {
          const date = new Date((value as number) * 1000).toISOString();
          console.log(`  ${key}: ${value} (${date})`);
        } else {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        }
      }

      if (jwtInfo.expired !== undefined) {
        console.log(
          `\nStatus: ${jwtInfo.expired ? "EXPIRED" : "Valid"}`
        );
        if (jwtInfo.expiresAt) {
          console.log(`  expires: ${jwtInfo.expiresAt}`);
        }
      }
    }
  } else {
    // Opaque token
    const info: TokenInfo = {
      type: "opaque",
      raw: token,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(info, null, 2));
    } else {
      console.log("Token type: Opaque (not a JWT)\n");
      console.log(`  length: ${token.length} characters`);
      console.log(`  prefix: ${token.substring(0, 8)}...`);
      console.log(
        "\nOpaque tokens cannot be decoded client-side."
      );
      console.log(
        "Use the Better Auth API to look up the session: auth.api.getSession()"
      );
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
