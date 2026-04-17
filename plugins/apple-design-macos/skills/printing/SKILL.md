---
name: printing
description: "Apps targeting iOS, iPadOS, macOS, or visionOS may incorporate the operating system's native printing features when contextually appropriate. If needed, these applications can present custom option…. Use when designing printing for macOS, auditing printing against Apple's macOS guidelines, or when the user says things like \"design printing for Mac\", \"printing on macOS\", \"how should printing work on Mac\"."
allowed-tools: Read Grep Glob
---

# Printing
Apps targeting iOS, iPadOS, macOS, or visionOS may incorporate the operating system's native printing features when contextually appropriate. If needed, these applications can present custom options specific to the document or printer

## When to use
- User asks about **printing** on macOS (e.g. `"how do I design printing for Mac"`).
- User is building a Mac UI that needs printing and wants to follow Apple's guidelines.
- User asks to audit or review printing in a macOS design.
- User mentions printing in the context of a Mac app, game, or interface.

### Best practices
- **Make printing discoverable.** Help users locate your print function by integrating it into standard system locations. For instance, include a Print item in the macOS app’s File menu; conversely, for iOS or iPadOS apps, add a toolbar button that launches an [action sheet](action-sheets.md). If your macOS app utilizes a toolbar, you may also include a Print button there, but consider making it an optional element that users can enable during toolbar customization.
- **Present a printing option only when it’s possible.** If there is no content available for printing, or if printers are unavailable, dim the Print item in a macOS app’s File menu and exclude the Print action from the Action sheet in an iOS or iPadOS application. If you implement a custom print button, ensure it is dimmed or hidden when printing cannot be performed.
- **Present relevant printing options.** If features such as selecting a page range, requesting multiple copies, or enabling double-sided printing are meaningful—and the printer supports these options—use the system’s native view to present them.

## Platform guidance — macOS
- **If your macOS app provides printing options unique to the application, consider implementing a custom category within the print panel.** The default print panel includes categories like Layout, Paper Handling, and Media & Quality. Assign a distinct name to your custom category (such as your app's title) and include options that enhance the printing experience specific to your application. For instance, Keynote offers specialized choices like printing presenter notes, slide backgrounds, or skipping slides.
- **If your application supports page settings unique to the document, consider implementing a page setup dialog.** A *page setup dialog* manages rarely adjusted settings—such as scaling, orientation, and page size—that apply when printing a specific document. If this feature fits your app's workflow, ensure you do not duplicate functions already handled by the system. For example, options for changing page orientation or printing in reverse order are managed natively by the operating system.
- **Ensure that the dependencies between options are clearly communicated.** For example, if double-sided printing is enabled, the option to print on transparencies must become unavailable.
- **Distinguish advanced features from those used frequently.** Consider utilizing a disclosure control to conceal complex options until they are required. Label these advanced choices as *Advanced Options*.
- **Consider allowing users to preview the impact of a setting.** For example, you might update a thumbnail image dynamically to reflect changes made to a tone control.
- **Consider persisting modified settings with the document.** At minimum, it is advisable to retain print configuration until the document is closed in case the user wishes to print it again.
