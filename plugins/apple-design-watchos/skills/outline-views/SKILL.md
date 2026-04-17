---
name: outline-views
description: "An outline view displays structured data hierarchically within a scrollable sequence of cells arranged in columns and rows. Use when designing outline views for watchOS, auditing outline views against Apple's watchOS guidelines, or when the user says things like \"design outline views for Apple Watch\", \"outline views on watchOS\", \"how should outline views work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Outline views
An outline view displays structured data hierarchically within a scrollable sequence of cells arranged in columns and rows

## When to use
- User asks about **outline views** on watchOS (e.g. `"how do I design outline views for Apple Watch"`).
- User is building an Apple Watch UI that needs outline views and wants to follow Apple's guidelines.
- User asks to audit or review outline views in a watchOS design.
- User mentions outline views in the context of an Apple Watch app, game, or interface.

![A stylized representation of a list of folders and images, displayed in an outline view containing four columns: [Name], [Date Modified], [Size], and [Kind]. The image is tinted red to subtly reflect the red in the original six-color Apple logo.](components-outline-view-intro.png)

An outline view must contain at least one column dedicated to the primary hierarchical data, such as a collection of parent containers and their respective children. Additional columns can be added to display supplementary attributes; for instance, modification dates or sizes. Parent containers feature disclosure triangles that allow users to expand and view their contained children.

Finder windows utilize an outline view for file system navigation.

### Best practices
Outline views are effective for displaying text-based content and frequently appear on the primary side of a [split view](split-views.md), with associated content displayed on the opposite side.

- **Use a table instead of an outline view to present data that is not hierarchical.** For guidance, refer to [Lists and tables](lists-and-tables.md).
- **Expose data hierarchy in the first column only.** Subsequent columns may display attributes pertaining to the hierarchical data presented in the primary column.
- **Use descriptive column headings to provide context.** Headings should use nouns or brief noun phrases with [title-style capitalization](https://help.apple.com/applestyleguide/#/apsgb744e4a3?sub=apdca93e113f1d64) and contain no punctuation; specifically, avoid a trailing colon. Always include column headings in a multi-column outline view. If you omit a heading in a single-column outline view, use a label or another method to ensure sufficient context is provided.
- **Consider allowing users to click column headings to sort an outline view.** In a sortable outline view, users can select a column heading to perform an ascending or descending sort based on that column. If necessary, you may implement secondary sorting mechanisms behind the scenes. When users click the primary column heading, sorting applies at every hierarchy level. For instance, in Finder, top-level folders are sorted first, followed by the items within each folder. If a user clicks a heading that is already sorted, the folders and their contents will sort again in the reverse direction.
- **Allow users to resize columns.** Since data displayed in an outline view often varies in width, it is crucial that users can adjust column widths as needed to display content wider than the current column constraints.
- **Make it simple for users to expand or collapse nested containers.** For example, clicking a disclosure triangle on a folder in Finder expands only that specific folder. However, Option-clicking the disclosure triangle will expand all of its subfolders.
- **Retain users’ expansion choices.** If users have expanded different levels of an outline view to reach a specific item, store this state so that it can be displayed again the next time. This prevents users from having to navigate back to the same location repeatedly.
- **Consider employing alternating row colors in multi-column outline views.** Alternating colors can assist users in tracking row values across columns, particularly when dealing with wide outline views.
- **Allow users to edit data if it makes sense within your application.** In an editable outline view cell, users expect that a single click will allow them to modify its contents. Note that a double-click may trigger a different response for a cell. For example, an outline view listing files might allow users to single-click a file name to edit it, but double-click the name to open the file. You may also enable users to reorder, add, or remove rows if this functionality proves useful.
- **Consider using a centered ellipsis to truncate cell text instead of clipping it.** An ellipsis placed in the middle preserves both the beginning and end of the cell text, which can make the content more distinct and recognizable than if it were simply clipped.
- **Consider offering a search field to help users quickly locate values in lengthy outline views.** Applications where the outline view is the main feature often include a search field within the toolbar. For guidance, see [Search fields](search-fields.md).
