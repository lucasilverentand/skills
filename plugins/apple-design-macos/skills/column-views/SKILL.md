---
name: column-views
description: "A column view, also referred to as a *browser*, allows users to visualize and move through a data hierarchy using a sequence of vertical columns. Use when designing column views for macOS, auditing column views against Apple's macOS guidelines, or when the user says things like \"design column views for Mac\", \"column views on macOS\", \"how should column views work on Mac\"."
allowed-tools: Read Grep Glob
---

# Column views
A column view, also referred to as a *browser*, allows users to visualize and move through a data hierarchy using a sequence of vertical columns

## When to use
- User asks about **column views** on macOS (e.g. `"how do I design column views for Mac"`).
- User is building a Mac UI that needs column views and wants to follow Apple's guidelines.
- User asks to audit or review column views in a macOS design.
- User mentions column views in the context of a Mac app, game, or interface.

Every column represents one level of the hierarchy and contains horizontal rows of data entries. Within a column, any parent item that includes nested child items is indicated by a triangle icon. When a user selects a parent, the subsequent column displays its associated children. Users can continue this navigation until they reach an item without any children, or they may move back up the hierarchy to explore alternative data branches.

> **Note**
> If you are managing how hierarchical content is presented in your iPadOS or visionOS application, consider utilizing [Split views](split-views.md).

### Best practices
When dealing with a deep data hierarchy where users frequently move back and forth between levels, and sorting features provided by [Lists and tables](lists-and-tables.md) are unnecessary, consider implementing a column view. For instance, Finder utilizes a column view (alongside icon, list, and gallery views) to browse directory structures.

- **Display the top level of your data hierarchy in the initial column.** Users should be aware they can rapidly scroll back to the first column to restart navigation from the root.
- **If an item has no nested content, display relevant details about the selected item.** Finder, for example, presents a preview and metadata such as creation date, modification date, file type, and size for the selected item.
- **Allow users to adjust column widths.** This is particularly crucial if some data item names exceed the default width.
