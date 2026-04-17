---
name: launching
description: "A smooth launch experience enables users to begin using your app or game immediately. Use when designing launching for tvOS, auditing launching against Apple's tvOS guidelines, or when the user says things like \"design launching for Apple TV\", \"launching on tvOS\", \"how should launching work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Launching
A smooth launch experience enables users to begin using your app or game immediately

## When to use
- User asks about **launching** on tvOS (e.g. `"how do I design launching for Apple TV"`).
- User is building an Apple TV UI that needs launching and wants to follow Apple's guidelines.
- User asks to audit or review launching in a tvOS design.
- User mentions launching in the context of an Apple TV app, game, or interface.

Launching commences when a user opens the application or game, includes any required initial downloads, and concludes once the first screen is rendered. Following launch completion, you may present an [Onboarding](onboarding.md) experience to give users a high-level introduction to your app or game.

### Best practices
- **Launch instantly.** Users expect immediate interaction upon starting your application or game, and waiting time should ideally not exceed a few seconds.
- **If the platform requires it, provide a launch screen.** On iOS, iPadOS, and tvOS, the system presents your launch screen immediately upon app or game startup. This screen is quickly replaced by the main experience, conveying a sense of speed and responsiveness to the user. Refer to [Launch screens](#Launch-screens) for detailed guidance. Launch screens are not mandatory for macOS, visionOS, or watchOS experiences.
- **If you need a splash screen, consider displaying it at the beginning of your onboarding flow.** A splash screen is an aesthetic graphic used to convey branding and necessary information concisely. If your application does not include an onboarding experience, you may display the splash screen immediately after launch completes.
- **Restore the previous state when your app restarts so people can continue where they left off.** Prevent users from needing to backtrack through steps to return to their previous location within the app or game. Restore as many granular details of the prior state as possible. For instance, recent scrolling positions should be maintained, and windows must reappear in the exact state and location they were exited.

### Launch screens
*Not applicable for macOS, visionOS, or watchOS.*

- **Minimize the launch experience.** The launch screen is not intended to function as part of an onboarding sequence or a splash display, nor should it serve as a canvas for artistic expression. Its singular purpose is to enhance the perception that your experience launches rapidly and is immediately operational.
- **Design a launch screen that closely mirrors the application or game's initial view.** If elements differ upon completion of the launch, users may experience an unpleasant flash between the launch screen and your first screen. If your app or game displays a solid color before transitioning to the first screen, use that same solid color for the launch screen. Furthermore, ensure your launch screen matches the device’s current orientation and appearance mode.
- **Do not include text on your launch screen, even if your first screen displays text.** Because the content in a launch screen does not change, any displayed text will not be localized.
- **Refrain from advertising.** The launch screen is not a branding opportunity. Avoid creating a screen that resembles a splash display or an “About” window, and do not include logos or other branding elements unless they are a fixed component of your app’s first screen.

## Platform guidance — tvOS
> **Note**
Unlike most tvOS applications that utilize [Layered images](images.md#Layered-images), the launch screen remains static.

**In a live-viewing application, consider automatically initiating playback shortly after the app is launched.** Users access your application specifically to watch television; therefore, it may be beneficial to begin playing new or previously viewed live content after a short period of inactivity. For more information, consult [Live-viewing apps](live-viewing-apps.md).
