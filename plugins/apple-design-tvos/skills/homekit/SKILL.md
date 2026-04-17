---
name: homekit
description: "HomeKit enables users to securely manage connected home accessories using Siri or through the Home app on iPhone, iPad, Apple Watch, and Mac. Use when designing homekit for tvOS, auditing homekit against Apple's tvOS guidelines, or when the user says things like \"design homekit for Apple TV\", \"homekit on tvOS\", \"how should homekit work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# HomeKit
HomeKit enables users to securely manage connected home accessories using Siri or through the Home app on iPhone, iPad, Apple Watch, and Mac

## When to use
- User asks about **homekit** on tvOS (e.g. `"how do I design homekit for Apple TV"`).
- User is building an Apple TV UI that needs homekit and wants to follow Apple's guidelines.
- User asks to audit or review homekit in a tvOS design.
- User mentions homekit in the context of an Apple TV app, game, or interface.

## Quick principles
- **Acknowledge the hierarchical model that HomeKit uses** — Even if your application does not organize devices by rooms and zones in its interface, referencing the HomeKit model is beneficial when…
- **Make it easy for people to find an accessory’s related HomeKit details** — If your app's organization is device-centric, do not obscure other HomeKit data—such as an accessory’s zone or room—in a difficult-to-find settings menu
- **Recognize that people can have more than one home** — Even if your app does not support the concept of multiple homes per user, consider including relevant home information in an accessory…
- **Don’t present duplicate home settings** — If your app offers a different perspective on how a home is organized, do not confuse users by requiring them to set…
- **Utilize the system-provided setup flow to ensure a familiar user experience** — The HomeKit setup process is faster than traditional methods because it allows users to name accessories, join networks, pair with HomeKit, assign…
- **Provide context explaining why your application requires access to users' Home data** — You must create a purpose string that includes a phrase detailing why permission is being requested, such as: “Lets you control this…
- **Do not require users to create an account or supply personal information** — Instead, defer any necessary information gathering to HomeKit
- **Respect users' setup decisions** — If users select HomeKit to configure your accessory, do not compel them to set up other platforms during the HomeKit setup flow
- **Carefully consider the timing and method for offering a custom accessory setup experience** — Always initiate with the system-provided setup flow
- **Propose service names appropriate for your accessory** — If your application identifies that a user has chosen an unsuitable name for Siri voice commands, suggest viable alternatives that are likely…
- **Validate that the provided names adhere to HomeKit naming conventions** — If your application allows users to modify service names, ensure the new names comply with these rules
- **Assist users in avoiding names that contain location details** — While using a name like "kitchen light" is intuitive for naming a fixture in the kitchen, including the room designation within the…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/terminology-and-layout.md
- @references/setup.md
- @references/siri-interactions.md
- @references/custom-functionality.md
- @references/using-homekit-icons.md
- @references/referring-to-homekit.md
