---
name: tap-to-pay-on-iphone
description: "Tap to Pay on iPhone allows merchants to accept contactless payments using their iPhone application, eliminating the need for external hardware connections. Use when designing tap to pay on iphone for iOS and iPadOS, auditing tap to pay on iphone against Apple's iOS and iPadOS guidelines, or when the user says things like \"design tap to pay on iphone for iPhone\", \"tap to pay on iphone on iOS and iPadOS\", \"how should tap to pay on iphone work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Tap to Pay on iPhone
Tap to Pay on iPhone allows merchants to accept contactless payments using their iPhone application, eliminating the need for external hardware connections

## When to use
- User asks about **tap to pay on iphone** on iOS and iPadOS (e.g. `"how do I design tap to pay on iphone for iPhone"`).
- User is building an iPhone UI that needs tap to pay on iphone and wants to follow Apple's guidelines.
- User asks to audit or review tap to pay on iphone in an iOS and iPadOS design.
- User mentions tap to pay on iphone in the context of an iPhone app, game, or interface.

## Quick principles
- **Ensure merchants accept the Tap to Pay on iPhone terms and conditions before they begin interacting with their customers** — Merchants must agree to the terms and conditions prior to any initial device configuration
- **Present the Tap to Pay on iPhone terms and conditions exclusively to an administrative user** — If a non-administrator attempts to activate the feature, display a message indicating that administrator privileges are required
- **If necessary, assist merchants in ensuring their device is current** — If your PSP mandates specific iOS versions, ensure that you present the terms and conditions only after the merchant has updated their…
- **Provide a tutorial that outlines the supported payment methods and demonstrates how to accept each type using Tap to Pay on iPhone** — You may deploy this tutorial by:
- **Provide Tap to Pay on iPhone as a checkout option whether the feature is enabled or not** — Including a Tap to Pay on iPhone button grants merchants flexibility by allowing them to utilize the feature without interrupting the checkout…
- **Avoid making merchants wait to use Tap to Pay on iPhone** — Beyond completing the initial setup for each device, a subsequent configuration is required every time your application returns to the foreground
- **Make sure the Tap to Pay on iPhone checkout option is available even if configuration is continuing in the background** — Merchants must always have the ability to select the Tap to Pay on iPhone checkout option within a checkout flow
- **If your app supports multiple payment-acceptance methods, make the Tap to Pay on iPhone button easy to find** — Do not require merchants to scroll to locate this feature
- **Make it easy for merchants to switch between Tap to Pay on iPhone and the hardware accessories you support** — Although your implementation of Tap to Pay on iPhone is distinct from your support for a hardware accessory (such as a Bluetooth…
- **Design your Tap to Pay on iPhone button to match the other buttons in your app** — Although you must adhere to the labels “Tap to Pay on iPhone” or “Tap to Pay” as specified above, you have the…
- **Determine the final amount that customers need to pay before merchants initiate the Tap to Pay on iPhone experience** — For instance, if your app supports tipping or other customer interactions that influence the total, ensure merchants offer these interactions before displaying…
- **If you support pre-payment options in your checkout flow, display them before the Tap to Pay on iPhone screen** — For example, if you allow customers to select different payment types, these options should be presented on your checkout screen after a…

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/enabling-tap-to-pay-on-iphone.md
- @references/educating-merchants.md
- @references/checking-out.md
- @references/displaying-results.md
- @references/additional-interactions.md
