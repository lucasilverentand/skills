---
name: app-clips
description: "An App Clip serves as a lightweight version of your application or game, offering an immediate, on-the-go demonstration experience. Use when designing app clips for tvOS, auditing app clips against Apple's tvOS guidelines, or when the user says things like \"design app clips for Apple TV\", \"app clips on tvOS\", \"how should app clips work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# App Clips
An App Clip serves as a lightweight version of your application or game, offering an immediate, on-the-go demonstration experience

## When to use
- User asks about **app clips** on tvOS (e.g. `"how do I design app clips for Apple TV"`).
- User is building an Apple TV UI that needs app clips and wants to follow Apple's guidelines.
- User asks to audit or review app clips in a tvOS design.
- User mentions app clips in the context of an Apple TV app, game, or interface.

## Quick principles
- **Enable users to complete a task or demo within your App Clip** — Do not mandate the installation of the full application for users to experience a demonstration, complete a task, or finish a game…
- **Concentrate on core functionalities** — Interactions within App Clips must be swift and targeted
- **Do not use App Clips exclusively for marketing** — App Clips must deliver tangible value and assist users in completing tasks
- **Avoid using web views in your App Clip** — App Clips rely on native frameworks and components to deliver a high-quality app experience
- **Design a linear, focused, and intuitive user interface** — App Clips do not require tab bars, complex navigation structures, or settings menus
- **Display the most relevant content upon launch** — Bypass unnecessary steps and immediately direct users to the part of the App Clip that matches their current context
- **Ensure immediate usability of your App Clip** — The App Clip must contain all necessary assets, omit splash screens, and launch without delay
- **Keep your App Clip size minimal** — The smaller the App Clip, the faster it launches on a user's device
- **Ensure your App Clip is shareable** — When a link to an App Clip is shared in the Messages app, recipients can launch it directly from within Messages
- **Facilitate easy payment for services or products** — Entering payment details can be a lengthy and error-prone process
- **Do not require account creation before a user benefits from your App Clip** — Account setup is a complex process requiring time and effort
- **Provide a consistent, focused experience when transitioning to your app** — When users install the full application, it replaces the App Clip on their device

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/designing-your-app-clip-overview.md
- @references/designing-your-app-clip-preserving-privacy.md
- @references/designing-your-app-clip-showcasing-your-app.md
- @references/designing-your-app-clip-limiting-notifications.md
- @references/designing-your-app-clip-creating-app-clips-for-businesses.md
- @references/creating-content-for-an-app-clip-card.md
- @references/app-clip-codes-overview.md
- @references/app-clip-codes-interacting-with-app-clip-codes.md
- @references/app-clip-codes-displaying-app-clip-codes.md
- @references/app-clip-codes-using-clear-messaging.md
- @references/app-clip-codes-customizing-your-app-clip-code.md
- @references/printing-guidelines.md
- @references/legal-requirements.md
