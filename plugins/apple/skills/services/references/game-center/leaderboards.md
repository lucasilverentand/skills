# Leaderboards
Leaderboards provide a valuable mechanism for fostering friendly competition within your game. By integrating with Game Center, players can easily compare their rankings against friends and global users, and they receive notifications regarding friend challenges or score advancements. You have the option to utilize the system-designed UI or present leaderboard data within a custom interface. For detailed developer guidance, refer to [Encourage progress and competition with leaderboards](apple:GameKit/encourage-progress-and-competition-with-leaderboards).

**Select a leaderboard type.** Game Center supports two types of leaderboards: *classic* and *recurring*.

- A *classic leaderboard* tracks a player’s highest lifetime score. Classic leaderboards remain perpetually active and do not conclude. Examples of goals suitable for a classic leaderboard include:

  - Aiming for the highest perfect score in a rhythm game.

  - Accumulating the most coins during a single dungeon run.

  - Achieving the longest uninterrupted duration in an endless runner.

- A *recurring leaderboard* resets based on a predefined time interval, such as daily or weekly. Recurring leaderboards can boost player engagement by offering multiple opportunities to achieve the top spot. Examples of features that pair well with recurring leaderboards:

  - Daily rotating puzzles

  - Seasonal or holiday-themed events

  - Weekly leaderboards for different battle modes

**Utilize leaderboard sets for multiple leaderboards.** Leaderboard sets serve as an organizational structure, simplifying the process for players to locate specific boards. Consider grouping these leaderboard sets based on themes or gameplay experiences, such as:

- Difficulty modes (Easy, Standard, Hard)
- Activity types (Combat, Crafting, Farming)
- Genres and themes (Disco, Pop, Rock)

**Include leaderboard images.** Leaderboard artwork offers another chance to reinforce your game's visual identity. Aim to create a unique image for each leaderboard that accurately reflects and showcases the ranking gameplay. Since leaderboards are viewed across the system, promoting ways for players to engage and compete with friends, compelling imagery is crucial for attracting users and enhancing the overall experience.

For games running on iOS, iPadOS, and macOS, use a single image for your leaderboard artwork. For tvOS, provide a series of images that animate when the artwork is in focus. To learn more about focus effects, consult **Focus and selection**. To assist with creating focusable images, download the tvOS template from [Apple Design Resources](https://developer.apple.com/design/resources/#tvos-apps). Use the following specifications when creating leaderboard artwork.

> **Note**
> Be aware of how cropping may influence your leaderboard artwork. In iOS, iPadOS, and macOS, the system crops artwork for leaderboards that are part of a leaderboard set. In tvOS, the focus effect on leaderboard artwork may crop your images at the edges of certain layers. Ensure that your primary content remains clearly visible in both these scenarios.
