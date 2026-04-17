---
name: sign-in-with-apple
description: "Sign in with Apple offers a rapid and private method for users to access apps and websites, providing a reliable experience they can trust while eliminating the need to recall numerous accounts and…. Use when designing sign in with apple for visionOS, auditing sign in with apple against Apple's visionOS guidelines, or when the user says things like \"design sign in with apple for Apple Vision Pro\", \"sign in with apple on visionOS\", \"how should sign in with apple work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Sign in with Apple
Sign in with Apple offers a rapid and private method for users to access apps and websites, providing a reliable experience they can trust while eliminating the need to recall numerous accounts and passwords

## When to use
- User asks about **sign in with apple** on visionOS (e.g. `"how do I design sign in with apple for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs sign in with apple and wants to follow Apple's guidelines.
- User asks to audit or review sign in with apple in a visionOS design.
- User mentions sign in with apple in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Ask users to sign in only when it provides value** — Users must understand the reason for signing in, so providing a brief description of the benefits is helpful
- **Postpone sign-in for as long as possible** — Users often drop off when they are forced to commit before experiencing the app's utility
- **If an account is mandatory, prompt users to create it before presenting any sign-in choices** — Begin by explaining why an account is necessary
- **Consider enabling users to link an existing account using Sign in with Apple** — If you support this linking feature, users can benefit from the convenience of Sign in with Apple while retaining access to information…
- **In a commerce application, wait until after purchase to ask users about account creation** — If you offer guest checkout, provide a quick path for users to create an account once the transaction is complete
- **Welcome users immediately upon successful Sign in with Apple completion** — Help users utilize their new account without delay; do not postpone the experience by requesting information that is not required
- **Indicate when users are currently signed in** — You can confirm the sign-in method by displaying a phrase such as “Using Sign in with Apple” within account or settings interfaces
- **Clarify whether the additional data you request is required or just recommended** — If supplying this information is legally or contractually necessary—for instance, agreeing to terms of service, specifying country/region of residence, birth date, or…
- **Don’t ask people to supply a password** — A primary advantage of Sign in with Apple is that users are relieved of the burden of creating and remembering extra passwords
- **Avoid asking for a personal email address when people supply a private relay address** — Sign in with Apple allows users to share a private relay address that automatically forwards messages to their verified personal email
- **Give people a chance to engage with your app before asking for optional data** — As users interact with your application, you can help them discover scenarios where providing more information benefits them
- **Be transparent about the data you collect** — Users appreciate knowing how their shared data is utilized

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/offering-sign-in-with-apple.md
- @references/collecting-data.md
- @references/displaying-buttons-overview.md
- @references/displaying-buttons-using-the-system-provided-buttons.md
- @references/displaying-buttons-creating-a-custom-sign-in-with-apple-button.md
