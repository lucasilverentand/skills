# Best practices
- **In general, ensure your map is interactive.** Users expect to be able to zoom, pan, and otherwise manipulate maps using familiar controls. Non-interactive elements that obscure the map can conflict with user expectations regarding how maps operate.
- **Select a map emphasis style appropriate for your application's needs.** There are two available styles:
- The *default* style displays the map with fully saturated colors and is suitable for most standard mapping applications that do not include extensive custom elements. This style also aids in maintaining visual consistency between your map and the Maps app when users switch between them.
- Conversely, the *muted* style presents a desaturated version of the map. This is ideal if you have information-rich content that needs to be highlighted against the background of the map.

For implementation guidance, refer to [MKStandardMapConfiguration.EmphasisStyle](apple:MapKit/MKStandardMapConfiguration/EmphasisStyle-swift.enum).

- **Assist users in locating places within your map.** Consider incorporating a search function alongside a mechanism to filter locations by category. For instance, the search field in a shopping mall map could include filters allowing users to easily locate common store types such as clothing, housewares, electronics, jewelry, and toys.
- **Clearly denote elements that users have selected.** When a user selects a specific area or element on the map, use distinct visual cues—such as an outline and color variation—to draw attention to that selection.
- **Group nearby points of interest into clusters to enhance map legibility.** A *cluster* uses a single marker to represent multiple points of interest located in close proximity. As users zoom into the map, these clusters expand to gradually reveal the individual points of interest.
- **Ensure users can view the Apple logo and legal link.** While it is acceptable for parts of your interface to temporarily cover the logo and link, they should not be obscured all the time. Follow these guidelines to maintain visibility of the Apple logo and legal link:
- Provide sufficient padding between the logo/link and the map boundaries or your custom controls. For example, using 7 points of padding on the sides and 10 points above and below works well.
- Prevent the logo and link from moving along with your interface. It is best if the Apple logo and legal link appear fixed relative to the map itself.
- If your custom interface can shift relative to the map, use the lowest position of that custom element to determine where the logo and link should be placed. For example, if your app allows users to pull up a custom card from the bottom of the screen, position the Apple logo and legal link 10 points above that card's lowest resting point.

> **Note**
> The Apple logo and legal link are not displayed on maps smaller than 200x100 pixels.
