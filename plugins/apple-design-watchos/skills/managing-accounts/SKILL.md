---
name: managing-accounts
description: "If an account does not present an unnecessary barrier to the user experience, it can serve as a convenient mechanism for users to access their content and manage personal information. Use when designing managing accounts for watchOS, auditing managing accounts against Apple's watchOS guidelines, or when the user says things like \"design managing accounts for Apple Watch\", \"managing accounts on watchOS\", \"how should managing accounts work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Managing accounts
If an account does not present an unnecessary barrier to the user experience, it can serve as a convenient mechanism for users to access their content and manage personal information

## When to use
- User asks about **managing accounts** on watchOS (e.g. `"how do I design managing accounts for Apple Watch"`).
- User is building an Apple Watch UI that needs managing accounts and wants to follow Apple's guidelines.
- User asks to audit or review managing accounts in a watchOS design.
- User mentions managing accounts in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Explain the benefits of creating an account and how to sign up** — If your application or game necessitates user accounts, provide a brief, friendly description explaining the requirement and its benefits
- **Delay sign-in for as long as possible** — Users often drop off when they are forced to authenticate before experiencing the core value of an application
- **If you don’t use Sign in with Apple in your iOS, iPadOS, macOS, or visionOS app, prefer using a passkey** — Passkeys streamline account setup and authentication by removing the need for users to create or manage passwords
- **Always identify the authentication method you offer** — For example, if your app uses Face ID for sign-in, title the button using a phrase such as “Sign In with Face…
- **Refer only to authentication methods that are available in the current context** — Do not mention Face ID on a device that does not support it
- **In general, avoid offering an app-specific setting for opting in to biometric authentication** — Since users enable biometric authentication at the system level, providing an in-app setting is redundant and may cause confusion
- **Provide a straightforward mechanism for users to initiate account deletion within your app or game** — If users cannot perform the account deletion inside your application, you must supply a direct link to the webpage where this action…
- **Ensure a uniform account deletion experience, whether users initiate it within your app/game or on the website** — For example, avoid making one deletion flow significantly longer or more complex than the other
- **Consider allowing users to schedule account deletion for a future date** — Users may appreciate the ability to utilize remaining services or wait until their subscription auto-renews before proceeding with deletion
- **Inform users when account deletion will be complete, and notify them upon its conclusion** — Since the full deletion process can sometimes require time, it is crucial to keep users updated on the status of the deletion…
- **If you support in-app purchases, help users understand how billing and cancellation function upon account deletion** — For instance, you may need to clarify the following scenarios:
- **Do not display a sign-out option when users are logged in at the system level** — If your application must include a sign-out feature, triggering it should prompt users to navigate to Settings > TV Provider to log…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
