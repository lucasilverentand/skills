---
name: undo-and-redo
description: "Undo and redo provide users with simple mechanisms to reverse different actions. Furthermore, these features enable safe exploration and experimentation while learning a new task or interface. Use when designing undo and redo for macOS, auditing undo and redo against Apple's macOS guidelines, or when the user says things like \"design undo and redo for Mac\", \"undo and redo on macOS\", \"how should undo and redo work on Mac\"."
allowed-tools: Read Grep Glob
---

# Undo and redo
Undo and redo provide users with simple mechanisms to reverse different actions. Furthermore, these features enable safe exploration and experimentation while learning a new task or interface

## When to use
- User asks about **undo and redo** on macOS (e.g. `"how do I design undo and redo for Mac"`).
- User is building a Mac UI that needs undo and redo and wants to follow Apple's guidelines.
- User asks to audit or review undo and redo in a macOS design.
- User mentions undo and redo in the context of a Mac app, game, or interface.

Users anticipate that undo and redo will reverse their most recent actions, leading them to attempt undoing—often multiple times—until a desired change occurs. In such scenarios, users may not recall which specific previous action an undo command is affecting, potentially causing unintended modifications and frustration. To ensure users maintain control, it is vital to assist them in predicting the results of undoing and redoing actions and clearly presenting those outcomes.

### Best practices
- **Help users anticipate the outcomes of undo and redo whenever possible.** For instance, on iPhone, you can describe the action's result in the alert that appears when the device is shaken, allowing users to choose whether to perform or cancel the undo. If you include undo and redo menu options, customize the labels to reflect the action's outcome. For example, a document application might label menu items as `Undo Typing` or `Redo Bold`.
- **Display the effects of an undo or redo.** Occasionally, the most recent action a user wishes to reverse impacts content or an area that is no longer visible. In such situations, it is vital to visually indicate the result of each undo and redo action so users do not believe the operation had no effect, which could cause them to repeat it. For example, if a user undoes the deletion of a paragraph in an area off-screen, you might scroll the document to display the restored paragraph.
- **Allow users to perform multiple undos.** Do not impose arbitrary limits on how many times a user can undo or redo. Users generally expect to be able to reverse every action taken since they performed a logical step, such as opening or saving the document.
- **Consider allowing users to revert multiple changes simultaneously.** In certain scenarios, users may benefit from the ability to undo a group of distinct but related actions—such as minor adjustments to a single property or attribute—without needing to reverse each individual change. Conversely, it may also be useful to provide a simple way for users to undo all modifications made since the document was opened or saved.
- **Include undo and redo buttons only when required.** Users typically expect to initiate undo and redo using system-supported methods, such as selecting items in a macOS app’s Edit menu, utilizing keyboard shortcuts on Mac or iPad, or shaking an iPhone. If dedicated undo and redo buttons are necessary in your application, use the standard system symbols and place them within a toolbar.

## Platform guidance — macOS
Implement undo and redo commands within the Edit menu and ensure compatibility with standard keyboard shortcuts. Mac users anticipate finding these functions at the top of the Edit menu and utilizing `Command–Z` and `Shift–Command–Z`, respectively, to execute undo and redo actions.
