---
name: popovers
description: "A popover functions as a temporary view that overlays other content upon activation by clicking or tapping an interactive control. Use when designing popovers for iOS and iPadOS, auditing popovers against Apple's iOS and iPadOS guidelines, or when the user says things like \"design popovers for iPhone\", \"popovers on iOS and iPadOS\", \"how should popovers work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Popovers
A popover functions as a temporary view that overlays other content upon activation by clicking or tapping an interactive control

## When to use
- User asks about **popovers** on iOS and iPadOS (e.g. `"how do I design popovers for iPhone"`).
- User is building an iPhone UI that needs popovers and wants to follow Apple's guidelines.
- User asks to audit or review popovers in an iOS and iPadOS design.
- User mentions popovers in the context of an iPhone app, game, or interface.

### Best practices
- **Use a popover to present limited information or functionality.** Since a popover disappears upon user interaction, restrict its functionality to only a few related tasks. For instance, a calendar event popover allows users to easily modify the date or time of an event or move it to another calendar. Once the change is made, the popover closes, allowing users to continue viewing their calendar events.
- **Consider using popovers when you require more screen real estate.** Views like sidebars and panels consume significant space. If content is only needed temporarily, displaying it within a popover can help streamline the interface.
- **Position popovers correctly.** Ensure the popover's arrow points as closely as possible to the element that triggered its appearance. Ideally, a popover should not obscure the triggering element or any essential content users might need while interacting with it.
- **Use a Close button solely for confirmation and guidance.** Including a Close button (such as Cancel or Done) is beneficial if it provides necessary context, like confirming whether changes are saved. Otherwise, a popover typically dismisses when users click or tap outside its boundaries or select an item within it. If multiple selections are possible, the popover must remain open until users explicitly dismiss it or click/tap outside its bounds.
- **Always save work when automatically closing a nonmodal popover.** Users might unintentionally dismiss a nonmodal popover by clicking or tapping outside its boundaries. Only discard user work when they click an explicit Cancel button.
- **Display only one popover at a time.** Showing multiple popovers clutters the interface and causes confusion. Never present a cascade or hierarchy of popovers, where one emerges from another. If you need to display a new popover, close the currently open one first.
- **Do not overlay another view on top of a popover.** Ensure that nothing displays over the popover, except for an alert.
- **When possible, allow users to open a new popover and close the previous one with a single click or tap.** Avoiding extra gestures is particularly important when several different bar buttons each trigger a popover.
- **Avoid making a popover excessively large.** A popover should only be sized sufficiently to display its contents and indicate its origin. If necessary, the system can dynamically adjust a popover's size to fit well within the interface.
- **Provide a smooth transition when changing a popover's size.** Some popovers offer both condensed and expanded views of the same information. If you adjust a popover's size, animate the change to prevent the impression that an entirely new popover has replaced the old one.

**Avoid using the term *popover* in help documentation.** Instead, refer to the specific task or selection. For example, instead of writing, “Select the Show button at the bottom of the popover,” you could write, “Select the Show button.”

**Avoid using a popover to display a warning.** Users might miss or accidentally dismiss a popover. If you need to issue a warning, use an [Alerts](alerts.md) instead.

## Platform guidance — iOS & iPadOS
**Do not display popovers when the view is compact.** Your application or game must dynamically adapt its layout based on the size class of the content area. Reserve popovers for wide views; instead, utilize all available screen space in compact views by presenting the information within a full-screen modal view, such as a sheet. For further guidance, consult [Modality](modality.md).
