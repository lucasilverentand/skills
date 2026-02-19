# Email

Email templates and sending utilities.

## Responsibilities

- Maintain email templates
- Provide email sending utilities
- Render and preview templates with sample data locally
- Manage transactional email provider configuration
- Ensure email templates are responsive and tested across clients

## Tools

- `tools/template-list.ts` — list all email templates with their subject lines and required variables
- `tools/template-preview.ts` — render an email template with sample data and open it in the browser
- `tools/send-test.ts` — send a test email to a given address using the configured provider
