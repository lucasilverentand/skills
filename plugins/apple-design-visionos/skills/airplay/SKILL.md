---
name: airplay
description: "AirPlay allows users to wirelessly transmit media content from iOS, iPadOS, macOS, and tvOS devices to Apple TV, HomePod, or any television/speaker that supports AirPlay. Use when designing airplay for visionOS, auditing airplay against Apple's visionOS guidelines, or when the user says things like \"design airplay for Apple Vision Pro\", \"airplay on visionOS\", \"how should airplay work on Apple Vision Pro\"."
allowed-tools: Read Grep Glob
---

# AirPlay
AirPlay allows users to wirelessly transmit media content from iOS, iPadOS, macOS, and tvOS devices to Apple TV, HomePod, or any television/speaker that supports AirPlay

## When to use
- User asks about **airplay** on visionOS (e.g. `"how do I design airplay for Apple Vision Pro"`).
- User is building an Apple Vision Pro UI that needs airplay and wants to follow Apple's guidelines.
- User asks to audit or review airplay in a visionOS design.
- User mentions airplay in the context of an Apple Vision Pro app, game, or interface.

## Quick principles
- **Prefer the system-provided media player** — The native media player offers a standard control set and supports features such as chapter navigation, subtitles, closed captioning, and AirPlay transmission
- **Provide content in the highest possible resolution** — Your [HTTP Live Streaming](apple:http-live-streaming) (HLS) playlist must include the full spectrum of available resolutions so that users can experience your content in…
- **Stream only the content people expect** — Avoid streaming materials like background loops or short video experiences that are only meaningful within the application's context
- **Support both AirPlay streaming and mirroring** — Offering support for both features provides users with maximum flexibility
- **Support remote control events** — When implemented, this allows users to select actions like play, pause, and fast forward using the lock screen, or through interaction with…
- **Don’t stop playback when your app enters the background or when the device locks** — For example, users expect a TV show they began streaming from your app to continue playing while they check email or put…
- **Don’t interrupt another app’s playback unless your app is starting to play immersive content** — For instance, if your application plays a video upon launch or auto-plays inline videos, play this content only on the local device…
- **Let people use other parts of your app during playback** — While AirPlay is active, your application must remain fully functional
- **If necessary, provide a custom interface for controlling media playback** — If you cannot utilize the system-provided media player, you may create a custom media player that offers users an intuitive method to…
- **Ensure the AirPlay icon is positioned identically to other technology icons** — If you enclose other technology icons within shapes, the AirPlay icon may also be displayed similarly
- **Do not incorporate the AirPlay icon or name into custom buttons or interactive components** — The icon and the term *AirPlay* should only appear in non-interactive contexts
- **Prioritize your application over AirPlay** — Ensure that references to AirPlay are less visually dominant than your app's name or primary identity

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
