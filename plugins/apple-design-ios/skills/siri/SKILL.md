---
name: siri
description: "Siri enables users to quickly complete daily tasks using voice, touch, or automation. Use when designing siri for iOS and iPadOS, auditing siri against Apple's iOS and iPadOS guidelines, or when the user says things like \"design siri for iPhone\", \"siri on iOS and iPadOS\", \"how should siri work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Siri
Siri enables users to quickly complete daily tasks using voice, touch, or automation

## When to use
- User asks about **siri** on iOS and iPadOS (e.g. `"how do I design siri for iPhone"`).
- User is building an iPhone UI that needs siri and wants to follow Apple's guidelines.
- User asks to audit or review siri in an iOS and iPadOS design.
- User mentions siri in the context of an iPhone app, game, or interface.

## Quick principles
- **Whenever possible, complete requests without leaving Siri** — If the request requires completion within your app, navigate users directly to the desired destination
- **When a request has a financial impact, default to the safest and least expensive option** — Never mislead or inaccurately represent information
- **When people request media playback from your app, consider providing alternative results if the request is ambiguous** — Displaying multiple choices within the Siri interface allows users to easily select different content if your initial suggestion is incorrect
- **On Apple Watch, design a streamlined workflow that requires minimal interaction** — Whenever possible, utilize intelligent defaults rather than soliciting user input
- **Create example requests** — When users access the Help section within the Siri interface, they view a guide that includes example phrases you provide
- **Define custom vocabulary that people use with your app** — To enable Siri to understand the actions performed by your application, define specific terms users might actually use in commands—such as account…
- **Consider defining alternative app names** — If users may refer to your application using different terms, providing a list of alternatives helps Siri understand their intent
- **Avoid including extraneous or redundant information** — While a custom interface allows you to incorporate app elements into the Siri environment, displaying details unrelated to the action can confuse…
- **Make sure people can still perform the action without viewing your custom interface** — Since users may switch to voice-only interaction with Siri at any time, it is essential that Siri conveys the same information you…
- **Use ample margins and padding in your custom interface** — Unless the content is designed to naturally flow off-screen, such as a map view, avoid allowing your content to extend to the…
- **Minimize the height of your interface** — Because the system displays other elements above and below your custom UI—including the text prompt, the spoken response, and the Siri waveform—aim…
- **Refrain from displaying your app name or icon** — This information is automatically provided by the system, making its inclusion in your custom interface redundant

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/integrating-your-app-with-siri-overview.md
- @references/integrating-your-app-with-siri-a-closer-look-at-intents.md
- @references/integrating-your-app-with-siri-provide-information-about-actions-and-support-suggestions.md
- @references/integrating-your-app-with-siri-design-a-great-voice-experience.md
- @references/integrating-your-app-with-siri-recognize-that-people-use-siri-in-different-contexts.md
- @references/system-intents.md
- @references/custom-intents-overview.md
- @references/custom-intents-custom-intent-categories-and-responses.md
- @references/custom-intents-design-a-custom-intent.md
- @references/custom-intents-help-people-customize-their-requests.md
- @references/custom-intents-enhance-the-voice-experience-for-custom-intents.md
- @references/shortcuts-and-suggestions-overview.md
- @references/shortcuts-and-suggestions-make-app-actions-widely-available.md
- @references/shortcuts-and-suggestions-create-shortcut-titles-and-subtitles.md
- @references/shortcuts-and-suggestions-provide-default-phrases-for-shortcuts.md
- @references/shortcuts-and-suggestions-make-shortcuts-customizable.md
- @references/editorial-guidelines.md
