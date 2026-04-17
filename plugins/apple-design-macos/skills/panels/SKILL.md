---
name: panels
description: "On macOS, a panel typically overlays other open windows, providing supplementary controls, options, or information pertaining to the active window or current selection. Use when designing panels for macOS, auditing panels against Apple's macOS guidelines, or when the user says things like \"design panels for Mac\", \"panels on macOS\", \"how should panels work on Mac\"."
allowed-tools: Read Grep Glob
---

# Panels
On macOS, a panel typically overlays other open windows, providing supplementary controls, options, or information pertaining to the active window or current selection

## When to use
- User asks about **panels** on macOS (e.g. `"how do I design panels for Mac"`).
- User is building a Mac UI that needs panels and wants to follow Apple's guidelines.
- User asks to audit or review panels in a macOS design.
- User mentions panels in the context of a Mac app, game, or interface.

Generally, a panel should possess less visual prominence than an app’s [macOS window states](windows.md#macOS-window-states). When appropriate, a panel may utilize a dark, translucent style to support a heads-up display (or *HUD*) experience.

When deploying your app on other platforms, consider employing a modal view to present supplementary content relevant to the current task or selection. Consult [Modality](modality.md) for implementation guidance.

### Best practices
- **Utilize a panel to provide users with rapid access to critical controls or information pertaining to the content they are currently editing.** For instance, a panel might offer controls or settings that influence a specific item selected within the active document or window.
- **Consider using a panel to display inspector functionality.** An *inspector* presents the specifics of the currently selected item, automatically refreshing its contents when the selection or the item itself changes. Conversely, if you must present an *Info* window—which maintains static content regardless of item selection—use a standard window, not a panel. Depending on your application's layout, you may also choose to implement an inspector using a [Split views](split-views.md) pane.
- **Prefer simple adjustment controls within a panel.** Whenever possible, avoid incorporating controls that require typing or selecting items to execute actions, as these inputs often necessitate multiple steps. Instead, consider using components like sliders and steppers, which allow users to achieve more immediate control.
- **Provide a concise title that defines the panel's function.** Since a panel may float above other open windows in your application, it requires a title bar to allow users to position it as desired. Create a brief title using a noun—or a noun phrase employing [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64)—that enables users to identify the panel on screen. For example, macOS features familiar panels titled “Fonts” and “Colors,” and many applications use the title “Inspector.”
- **Manage panel visibility appropriately.** When your application gains focus, bring all its open panels to the foreground, regardless of which window was active when the panel opened. When your application loses focus, hide all its panels.
- **Exclude panels from the Window menu's document list.** While it is acceptable to include commands for showing or hiding panels in the [Window menu](the-menu-bar.md#Window-menu), panels are not documents or standard application windows, and therefore they do not belong in the Window menu's list.
- **Generally, refrain from making a panel's minimize button available.** Users rarely need to minimize a panel because it appears only when required and automatically disappears when the application is inactive.
- **Reference panels by their title in your interface and help documentation.** In menus, refer to the panel's title without including the word *panel*; for example, use “Show Fonts,” “Show Colors,” or “Show Inspector.” In help documentation, introducing "panel" as a distinct window type can be confusing, so it is generally best to refer to the panel by its title or—if clarity warrants it—by appending *window* to the title. For instance, the title “Inspector” often provides sufficient context on its own, whereas using “Fonts window” and “Colors window,” instead of just “Fonts” and “Colors,” may be clearer.

### HUD-style panels
A HUD-style panel functions identically to a standard panel, but it features a darker and translucent aesthetic. HUDs are best suited for applications that present highly visual content or offer an immersive experience, such as slideshows or media editing tools. For instance, QuickTime Player employs a HUD to display inspector details without excessively covering the content.

**Prefer standard panels.** A HUD can confuse or distract users if its presence is not logically justified. Furthermore, a HUD may conflict with the application's current appearance settings. Generally, restrict HUD usage to situations where:

- The app is media-centric and displays films, photographs, or slides.
- A standard panel would block crucial content.
- Controls are unnecessary—with the exception of the disclosure triangle, most system controls do not match a HUD's visual style.
- **Maintain one panel style when your app switches modes.** For example, if you utilize a HUD while the application is in full-screen mode, it is preferable to keep the HUD style active when users exit full-screen.
- **Use color sparingly in HUDs.** Excessive color within the dark appearance of a HUD can be distracting. Often, only small amounts of high-contrast color are needed to draw attention to important information within a HUD.
- **Keep HUDs small.** Since HUDs are intended to be unobtrusively helpful, allowing them to become too large defeats their primary purpose. Ensure a HUD does not hide the content it is adjusting, nor should it compete with the main content for user focus.

For developer guidance, see [hudWindow](apple:AppKit/NSWindow/StyleMask-swift.struct/hudWindow).
