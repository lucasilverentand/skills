const args = Bun.argv.slice(2);

const HELP = `
send-test — Send a test email using a template to a given address

Usage:
  bun run tools/send-test.ts <template-name> <email-address> [options]

Arguments:
  template-name    Name of the template file (without extension)
  email-address    Recipient email address

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Requires RESEND_API_KEY (or equivalent) to be set in the environment.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

async function main() {
  const templateName = filteredArgs[0];
  const emailAddress = filteredArgs[1];

  if (!templateName) {
    console.error("Error: missing required template-name argument");
    process.exit(1);
  }

  if (!emailAddress) {
    console.error("Error: missing required email-address argument");
    process.exit(1);
  }

  // Validate email format
  if (!emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.error(`Error: invalid email address '${emailAddress}'`);
    process.exit(1);
  }

  const root = process.cwd();

  // Find the template
  const candidates = [
    `${root}/src/templates/${templateName}.tsx`,
    `${root}/src/templates/${templateName}.jsx`,
    `${root}/src/${templateName}.tsx`,
  ];

  let templatePath: string | null = null;
  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists()) {
      templatePath = candidate;
      break;
    }
  }

  if (!templatePath) {
    console.error(`Error: template '${templateName}' not found`);
    process.exit(1);
  }

  // Check for API key
  const apiKey =
    process.env.RESEND_API_KEY ||
    process.env.POSTMARK_API_KEY ||
    process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.error(
      "Error: no email provider API key found in environment"
    );
    console.error(
      "Set one of: RESEND_API_KEY, POSTMARK_API_KEY, SENDGRID_API_KEY"
    );
    process.exit(1);
  }

  // Determine provider
  let provider: "resend" | "postmark" | "sendgrid";
  if (process.env.RESEND_API_KEY) provider = "resend";
  else if (process.env.POSTMARK_API_KEY) provider = "postmark";
  else provider = "sendgrid";

  // Try to render and send
  const renderScript = `
    const mod = await import("${templatePath}");
    const Component = mod.default || Object.values(mod).find(v => typeof v === "function");
    if (!Component) { console.error("No component found"); process.exit(1); }

    let html;
    try {
      const { render } = await import("@react-email/render");
      html = await render(Component({ name: "Test User", loginUrl: "https://example.com" }));
    } catch {
      html = "<p>Template rendered without @react-email/render</p>";
    }

    const subjectFn = mod.subject;
    const subject = typeof subjectFn === "function"
      ? subjectFn({ name: "Test User" })
      : "Test email: ${templateName}";

    console.log(JSON.stringify({ html, subject }));
  `;

  const proc = Bun.spawn(["bun", "-e", renderScript], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error("Error: failed to render template");
    process.exit(1);
  }

  let rendered: { html: string; subject: string };
  try {
    rendered = JSON.parse(stdout.trim());
  } catch {
    console.error("Error: failed to parse rendered template output");
    process.exit(1);
  }

  // Send via Resend API
  if (provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "test@resend.dev",
        to: emailAddress,
        subject: rendered.subject,
        html: rendered.html,
      }),
    });

    const result = await response.json();

    if (jsonOutput) {
      console.log(JSON.stringify({ ok: response.ok, provider, to: emailAddress, template: templateName, result }, null, 2));
    } else {
      if (response.ok) {
        console.log(`Test email sent to ${emailAddress}`);
        console.log(`  template: ${templateName}`);
        console.log(`  subject: ${rendered.subject}`);
        console.log(`  provider: ${provider}`);
      } else {
        console.error(`Failed to send: ${JSON.stringify(result)}`);
        process.exit(1);
      }
    }
  } else {
    console.error(`Error: provider '${provider}' send not implemented — use Resend`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
