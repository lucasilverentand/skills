---
name: game-center
description: "Game Center functions as Apple's social gaming network. It enables players to monitor their progress, connect with friends across different Apple platforms, and enhances the visibility of your game…. Use when designing game center for watchOS, auditing game center against Apple's watchOS guidelines, or when the user says things like \"design game center for Apple Watch\", \"game center on watchOS\", \"how should game center work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Game Center
Game Center functions as Apple's social gaming network. It enables players to monitor their progress, connect with friends across different Apple platforms, and enhances the visibility of your game on users' devices

## When to use
- User asks about **game center** on watchOS (e.g. `"how do I design game center for Apple Watch"`).
- User is building an Apple Watch UI that needs game center and wants to follow Apple's guidelines.
- User asks to audit or review game center in a watchOS design.
- User mentions game center in the context of an Apple Watch app, game, or interface.

## Quick principles
- **Display the access point within menu screens** — You should consider integrating the access point into your game's main menu or settings section
- **Avoid placing controls near the access point** — You have the option to position the access point in any of the four screen corners using a fixed placement
- **Consider pausing your game when the Game Overlay or dashboard is visible** — Pausing the game assists players in reviewing their Game Center data without feeling that the game continues while they are viewing information
- **Use the artwork Game Center provides in custom links** — When referencing Game Center features within your custom UI, use the official artwork from [Apple Design Resources](https://developer.apple.com/design/resources/#technologies)
- **Use the correct terminology in custom links** — The following table details how to correctly apply Game Center terminology, helping you prevent confusion for players using your custom UI
- **Align with Game Center achievement states** — Game Center utilizes four defined achievement statuses: locked, in-progress, hidden, and completed
- **Determine a display order** — The sequence in which you upload achievements dictates their on-screen appearance, so establish the desired display order before uploading assets
- **Be succinct when describing achievements** — The achievement card imposes a two-line limit for both the title and description
- **Give players a sense of progress** — When implementing progressive achievements, the system displays the player's current advancement and delivers motivational prompts—such as “Youʼre more than halfway to completing…
- **Design rich, high-quality images that help players feel rewarded** — Given that achievements are a prominent feature within the Game Center UI, it is crucial to provide high-quality assets that capture attention…
- **Create artwork in the appropriate size and format** — The system applies a circular mask to your achievement image, so ensure that all content is kept centered
- **Select a leaderboard type** — Game Center supports two types of leaderboards: *classic* and *recurring*

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/overview.md
- @references/accessing-game-center.md
- @references/achievements.md
- @references/leaderboards.md
- @references/challenges.md
- @references/multiplayer-activities.md
- @references/platform-guidance-watchos.md
