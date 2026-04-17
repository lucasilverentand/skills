---
name: loading
description: "Optimal content loading occurs when the user remains unaware of the process. Use when designing loading for watchOS, auditing loading against Apple's watchOS guidelines, or when the user says things like \"design loading for Apple Watch\", \"loading on watchOS\", \"how should loading work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Loading
Optimal content loading occurs when the user remains unaware of the process

## When to use
- User asks about **loading** on watchOS (e.g. `"how do I design loading for Apple Watch"`).
- User is building an Apple Watch UI that needs loading and wants to follow Apple's guidelines.
- User asks to audit or review loading in a watchOS design.
- User mentions loading in the context of an Apple Watch app, game, or interface.

If your application or game is loading assets, levels, or other resources, ensure that the behavior does not disrupt or negatively affect the user experience.

### Best practices
- **Display content as quickly as possible.** If users must wait for all loading to finish before seeing anything, they may perceive the lack of content as a flaw in your application or game. Instead, consider displaying placeholder text, visuals, or animations while content is loading, subsequently replacing these elements once they are ready.
- **Allow users to perform other actions in your app or game while content loads.** Loading assets in the background allows users continued access to different functions. For instance, a game could load content while players review the next level or browse an in-game menu. For development guidance, consult [Improving the player experience for games with large downloads].
- **If loading requires an extended and unavoidable duration, provide engaging content to occupy the user's attention.** For example, you could offer gameplay suggestions, display helpful tips, or introduce new features. Accurately estimate the remaining loading time to ensure users have sufficient duration to appreciate your placeholder content, while also avoiding excessive wait times that necessitate repetition.
- **Optimize installation and launch speeds by downloading large assets in the background.** Consider utilizing the [Background Assets] framework to schedule asset downloads—such as level packs, 3D character models, and textures—to happen immediately following installation, during updates, or at other non-disruptive intervals.

### Showing progress
- **Ensure users are clearly informed about content loading and its expected completion time.** While instantaneous display is the goal, if loading requires more than a couple of moments, employ system-provided components—known as *progress indicators*—to signal that the process is underway. Generally, utilize a *determinate* progress indicator when the loading duration is predictable, and an *indeterminate* indicator when it is not. Refer to [Progress indicators](progress-indicators.md) for detailed guidance.
- **When developing games, consider implementing a custom loading screen.** Standard progress indicators are suitable for most applications, but they may clash with the aesthetic of a game. To provide a more immersive experience, consider designing custom animations and elements that align with your game's specific style.

## Platform guidance — watchOS
Minimize the use of loading indicators within your watchOS experience. Given that users anticipate swift interactions with their Apple Watch, strive to render content instantly. Should the content require a brief delay (a few seconds), displaying a loading indicator is preferable to presenting a blank screen.
