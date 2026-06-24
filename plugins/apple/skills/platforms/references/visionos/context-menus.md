# Context menus
A context menu grants access to item-specific functionality without adding visual clutter to the interface

## Platform guidance — visionOS
- **Use a context menu rather than a panel or inspector window for frequently accessed features.** Minimizing the number of separate views or windows your application presents helps users maintain a clean workspace.
- **Generally, ensure a context menu does not exceed the height of its containing window.** In visionOS, a window encompasses system components above and below its edges (such as window-management controls and the Share menu); consequently, an excessively tall context menu could obscure these elements. When considering how many items to include, base your design on how users are likely to interact with your application. For example, individuals using an app for deep, specialized tasks often anticipate learning many sophisticated commands and may value contextual access to them. Conversely, users who perform only a few simple actions might prefer short contextual menus that are quick to scan and utilize.
