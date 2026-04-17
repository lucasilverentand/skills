---
name: icloud
description: "iCloud is a service that allows users to access their important content—including photos, videos, and documents—across any device without needing explicit synchronization. Use when designing icloud for watchOS, auditing icloud against Apple's watchOS guidelines, or when the user says things like \"design icloud for Apple Watch\", \"icloud on watchOS\", \"how should icloud work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# iCloud
iCloud is a service that allows users to access their important content—including photos, videos, and documents—across any device without needing explicit synchronization

## When to use
- User asks about **icloud** on watchOS (e.g. `"how do I design icloud for Apple Watch"`).
- User is building an Apple Watch UI that needs icloud and wants to follow Apple's guidelines.
- User asks to audit or review icloud in a watchOS design.
- User mentions icloud in the context of an Apple Watch app, game, or interface.

Transparency is a fundamental characteristic of iCloud. Users should not need to be aware of the content's physical location; they can operate under the assumption that they are always viewing the most up-to-date version.

### Best practices
- **Facilitate seamless integration with iCloud.** Users enable iCloud in Settings and anticipate that your app will function within this ecosystem automatically. If users must choose whether to utilize iCloud with your application, present a simple option upon the initial launch that allows them to select between full iCloud usage or opting out entirely.
- **Minimize user management of documents in iCloud.** Most users expect their entire content library to reside within iCloud and do not wish to manage the storage location of individual files. Evaluate how your app handles and presents content, striving to automate file management tasks as much as possible.
- **Maintain current content synchronization.** In an app utilizing iCloud, users should ideally always have access to the most recent version of their content. However, this experience must be balanced against device storage limitations and bandwidth usage. If your app deals with exceptionally large documents, it may be preferable to allow the user control over when updated content is downloaded. If your app falls into this category, implement a mechanism to signal that a newer version of the document is available in iCloud. When a download is occurring, provide subtle feedback if the process exceeds a few seconds.
- **Be mindful of iCloud storage constraints.** Since iCloud is a paid, finite resource, use it to store information that the user creates and understands. Avoid using it for app resources or content that can be regenerated. Even if your application does not implement iCloud features, remember that iCloud backups include the contents of every app’s Documents folder. To prevent excessive storage consumption, be selective about the content placed in the Documents folder.
- **Ensure graceful behavior when iCloud is inaccessible.** If a user manually disables iCloud or activates Airplane Mode, you are not required to display an alert indicating that iCloud is unavailable. Nevertheless, it may still be beneficial to subtly inform users that changes they make might not sync across devices until iCloud access is restored.
- **Store application state information in iCloud.** Beyond documents and files, you can leverage iCloud to persist settings and track the operational state of your app. For instance, a magazine application could save the last viewed page number, allowing a user on another device to resume reading where they left off. If you use iCloud for settings, ensure these are ones the user intends to apply across all their devices. Certain configurations, for example, might be more relevant in a professional context than a personal one.
- **Provide warnings regarding document deletion consequences.** When a user deletes a document within an app that supports iCloud, the item is removed from both iCloud and all other synchronized devices. Therefore, you must display a warning and obtain confirmation before executing the deletion.
- **Make conflict resolution intuitive and straightforward.** Whenever feasible, attempt to detect and resolve version conflicts automatically. If automatic resolution is not possible, present an unobtrusive notification that clearly differentiates and facilitates the choice between conflicting versions. Ideally, conflict resolution should occur as early as possible to prevent wasted time on the incorrect version.
- **Include iCloud content within search results.** Users with iCloud accounts assume their content is universally available, and they expect search functionality to reflect this assumption.
- **For games, consider using iCloud for player progress saving.** While you may implement this functionality yourself, the GameSave framework provides an efficient solution. It synchronizes save data across devices and offers integrated alerts that can assist players in managing syncing issues during offline play or when conflicts arise. Alternatively, you may implement custom UI that utilizes GameSave data to manage these situations. For developer guidance, see [GameSave](apple:GameSave).
