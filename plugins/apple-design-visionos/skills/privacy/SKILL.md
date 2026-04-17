---
name: privacy
description: "Privacy is essential: maintaining transparency regarding the data and resources your application requires, alongside diligently protecting any user data you access, is critical. Use when designing privacy for visionOS, auditing privacy against Apple's visionOS guidelines, or when the user says things like \"design privacy for Apple Vision Pro\", \"privacy on visionOS\", \"how should privacy work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# Privacy
Privacy is essential: maintaining transparency regarding the data and resources your application requires, alongside diligently protecting any user data you access, is critical

## When to use
- User asks about **privacy** on visionOS (e.g. `"how do I design privacy for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs privacy and wants to follow Apple's guidelines.
- User asks to audit or review privacy in a visionOS design.
- User mentions privacy in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Request access only to data that you actually need** — If your application requests more information than a feature requires, or if it asks for data before the user has shown interest…
- **Be transparent about how your app collects and uses people’s data** — Users are less inclined to share information if they do not clearly understand your intended usage of that data
- **Process data on the device where possible** — For instance, within iOS, you can leverage the Apple Neural Engine and custom CreateML models to handle data processing locally on the…
- **Adopt system-defined privacy protections and follow security best practices** — For example, starting with iOS 15, you can utilize CloudKit to supply encryption and key management for different data types, including strings…
- **Only request permission when your app genuinely requires access to the data or resource** — Users are naturally skeptical of requests for personal information or device capability access, especially if the need is not immediately apparent
- **Do not request permission upon launch unless the data or resource is essential for your app's core functionality** — Users are less likely to object to a launch-time request when the necessity is obvious
- **Provide copy that clearly explains how your app utilizes the ability, data, or resource being requested** — Your application's copy (known as a *purpose string* or *usage description string*) appears in the standard alert after your app's name and…
- **Include only one button and make it clear that it opens the system alert** — Users may feel manipulated if a custom screen or window contains buttons other than one that launches the alert, as this distracts…
- **Never precede the system-provided alert with a custom screen or window that could confuse or mislead people** — Users sometimes tap alerts to dismiss them without reading the content
- **Consider using the location button to provide users with a lightweight method for sharing their location for specific app features** — For instance, your application might help users attach their location to a message or post, locate a store, or identify a building…
- **Consider customizing the location button to harmonize with your application’s visual design** — Specifically, you have the ability to:
- **Avoid relying solely on passwords for authentication** — Whenever feasible, utilize [passkeys](apple:authenticationservices/public-private_key_authentication/supporting_passkeys/) instead of passwords

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/best-practices.md
- @references/requesting-permission.md
- @references/location-button.md
- @references/protecting-data.md
- @references/platform-guidance-visionos.md
