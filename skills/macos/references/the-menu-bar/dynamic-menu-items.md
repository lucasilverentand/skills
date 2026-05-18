# Dynamic menu items
In specific scenarios, presenting a *dynamic menu item* may be appropriate. A dynamic menu item is one whose behavior changes when selected while a modifier key (Control, Option, Shift, or Command) is held down. For instance, the *Minimize* entry in the Window menu shifts to *Minimize All* when the Option key is pressed.

- **Do not rely solely on a dynamic menu item to complete a task.** Since these items are hidden by default, they function best as shortcuts for advanced actions that users can also perform through alternative means. For example, if a user has not encountered the *Minimize All* dynamic menu item in the Window menu, they retain the ability to minimize each individual open window.
- **Deploy dynamic menu items mainly within menu bar menus.** Placing a dynamic menu item in contextual or Dock menus increases the difficulty of user discovery.
- **Limit revelation to a single modifier key.** Requiring multiple keys simultaneously while opening and selecting a menu item is physically cumbersome, and it also decreases the discoverability of this dynamic behavior. For implementation guidance, consult [isAlternate](apple:AppKit/NSMenuItem/isAlternate).

> **Tip**
> macOS automatically adjusts the menu width to accommodate the widest item, including those that are dynamic.
