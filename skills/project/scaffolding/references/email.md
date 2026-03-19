# Email

The `email` part contains transactional email templates (React Email) and sending utilities.

## Setup

1. Create `packages/email/`
2. Install: `bun add @react-email/components resend`

### Package structure

```
packages/email/
  src/
    templates/     # One file per email template
    provider.ts    # Email provider client (Resend)
    send.ts        # Generic send utility
    index.ts       # Re-export templates and send
```

## Adding a template

Create `src/templates/<name>.tsx`:

```tsx
import { Html, Body, Container, Text, Button } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hi {name}, welcome aboard!</Text>
          <Button href={loginUrl}>Get started</Button>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = ({ name }: WelcomeEmailProps) => `Welcome, ${name}!`;
```

## Sending

```ts
import { render } from "@react-email/render";

export async function sendEmail<T>({
  to, template: Template, subject, props,
}: SendEmailOptions<T>): Promise<{ ok: boolean; error?: string }> {
  const html = await render(<Template {...props} />);
  // call provider
}
```

- Return `{ ok, error }` — never throw
- Import provider credentials from `@scope/config`

## Provider

Supported: Resend (preferred), Postmark, SendGrid. Configure in `src/provider.ts` using env vars from `@scope/config`.

## Tools

| Tool | Purpose |
|---|---|
| `tools/template-list.ts` | All templates with subjects and required variables |
| `tools/template-preview.ts` | Render template with sample data, open in browser |
| `tools/send-test.ts` | Send a test email to a given address |
