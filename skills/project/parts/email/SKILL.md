---
name: email
description: Manages the email workspace package — transactional email templates and sending utilities. Use when adding email templates, configuring the email provider, previewing templates, or sending test emails.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Email

The `email` part contains all transactional email templates and the utilities to render and send them. Templates are React components rendered to HTML — keep them self-contained and testable.

## Decision Tree

- What are you doing?
  - **Adding a new email template** → see "Adding a template" below
  - **Changing the email provider** → see "Provider configuration" below
  - **Previewing a template** → run `tools/template-preview.ts <template-name>`
  - **Sending a test email** → run `tools/send-test.ts <template-name> <address>`
  - **Listing all templates** → run `tools/template-list.ts`

## Adding a template

1. Create `src/templates/<name>.tsx` — a React component that returns email-safe JSX
2. Use `@react-email/components` for layout primitives (`Html`, `Head`, `Body`, `Container`, `Text`, `Button`, `Link`, `Img`)
3. Define a typed props interface — all variables the template needs
4. Export a `subject` function that takes the same props and returns the subject line
5. Register the template in `src/index.ts` — export the component and subject function

```ts
// src/templates/welcome.tsx
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

export const subject = ({ name }: WelcomeEmailProps) =>
  `Welcome, ${name}!`;
```

## Sending emails

Create a `send` utility in `src/send.ts` — it takes a template name and props, renders to HTML, then calls the provider:

```ts
import { render } from "@react-email/render";

export async function sendEmail<T>({
  to,
  template: Template,
  subject,
  props,
}: SendEmailOptions<T>): Promise<{ ok: boolean; error?: string }> {
  const html = await render(<Template {...props} />);
  // call provider here
}
```

- Return `{ ok, error }` — never throw
- Import provider credentials from `@scope/config`

## Provider configuration

Supported providers: Resend (preferred), Postmark, SendGrid.

Configure in `src/provider.ts` — instantiate the client using env vars from `@scope/config`:

```ts
import { Resend } from "resend";
import { env } from "@scope/config";

export const resend = new Resend(env.RESEND_API_KEY);
```

- Add `RESEND_API_KEY` (or equivalent) to `@scope/config` env schema when switching providers
- Run `tools/send-test.ts` after provider changes to verify delivery

## Package structure

```
packages/email/
  src/
    templates/     # One file per email template
    provider.ts    # Email provider client
    send.ts        # Generic send utility
    index.ts       # Re-export templates and send
  package.json
  tsconfig.json
```

## Key references

| File | What it covers |
|---|---|
| `tools/template-list.ts` | All templates with subjects and required variables |
| `tools/template-preview.ts` | Render template with sample data, open in browser |
| `tools/send-test.ts` | Send a test email to a given address |
