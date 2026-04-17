---
name: onboarding
description: "Onboarding assists users in achieving a rapid start with your application or game. Use when designing onboarding for visionOS, auditing onboarding against Apple's visionOS guidelines, or when the user says things like \"design onboarding for Apple Vision Pro\", \"onboarding on visionOS\", \"how should onboarding work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Onboarding
Onboarding assists users in achieving a rapid start with your application or game

## When to use
- User asks about **onboarding** on visionOS (e.g. `"how do I design onboarding for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs onboarding and wants to follow Apple's guidelines.
- User asks to audit or review onboarding in a visionOS design.
- User mentions onboarding in the context of an Apple Vision Pro app, game, or interface.

Ideally, users should be able to understand the app or game simply through interaction; however, if onboarding is required, design a flow that is fast, enjoyable, and optional. If provided, onboarding occurs after [Launching](launching.md) is finished—it should not be part of the initial launch experience.

### Best practices
- **Teach through interactivity.** Users retain and grasp information more effectively when they can actively perform the task rather than passively viewing instructional material. Whenever possible, offer an interactive onboarding experience that allows users to safely test actions, discover features, or try game mechanics.
- **Consider providing a collection of context-specific tips instead of a single onboarding flow.** Integrating tips relevant to the user's current situation helps them learn about their task while making progress in your application or game. A context-specific tip also improves learning because it allows the user to concentrate on one action or task before encountering new information. If your instructional content refers to a specific part of the interface, display those instructions near that area. For guidance on implementation, consult [TipKit](apple:TipKit).
- **If you need to present a prerequisite onboarding flow, design a brief, enjoyable experience that doesn’t require people to memorize a lot of information.** When onboarding is quick and engaging, users are more likely to complete it. Conversely, attempting to teach too much can overwhelm the user and reduce retention.
- **If it makes sense to offer a separate tutorial, consider making it optional.** If users can skip the tutorial upon first launch of your app or game, do not present it again on subsequent launches, but ensure it remains easily accessible if they wish to view it later. For instance, you might place the tutorial in a help section, account area, or settings menu within your application or game.
- **Keep onboarding content focused on the experience you provide.** Users enter your onboarding flow to learn about your app or game; they do not need instruction on how to use the device or operating system itself.

### Additional content
- **If a splash screen is required, display it briefly.** If you choose to include one, ensure the graphic is visually appealing and conveys its message clearly. The display duration should be sufficient for users to quickly absorb the information without feeling unduly delayed.
- **Do not allow extensive downloads to impede the onboarding process.** Users expect to begin using your app or game immediately upon first launch, regardless of whether they follow the onboarding flow or skip it. Include enough media and content within your software package so users are not required to wait for downloads before they can interact with the app or game. For guidance, see [Launching](launching.md).
- **Omit licensing information from your onboarding flow.** Allow the App Store to display agreements and disclaimers, enabling users to read them before downloading your app or game. If you must include these items within the onboarding flow, integrate them in a balanced manner that does not disrupt the experience.

### Additional requests
- **Delay nonessential setup or customization processes.** Offer sensible default settings so that the majority of users can begin using your application or game immediately without needing further configuration.
- **If your app or game requires access to private data or resources before it is functional, consider incorporating the permission request into your onboarding sequence.** When making this request during onboarding, you gain the chance to explain why your app or game requires permission and what benefits users receive by granting it. If this is not the case, present the permission prompt when users initially attempt to use the specific feature that depends on private data or resources. For detailed guidance, refer to [Requesting permission](privacy.md#Requesting-permission).
- **It is advisable to allow users to experience your app or game before prompting them for ratings or purchases.** Users are more likely to respond favorably to these requests after they have become engaged with your application or game.
