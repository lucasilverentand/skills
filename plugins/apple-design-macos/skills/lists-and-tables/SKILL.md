---
name: lists-and-tables
description: "Tables and lists display information arranged across one or more columns of rows. Use when designing lists and tables for macOS, auditing lists and tables against Apple's macOS guidelines, or when the user says things like \"design lists and tables for Mac\", \"lists and tables on macOS\", \"how should lists and tables work on Mac\"."
allowed-tools: Read Grep Glob
---

# Lists and tables
Tables and lists display information arranged across one or more columns of rows

## When to use
- User asks about **lists and tables** on macOS (e.g. `"how do I design lists and tables for Mac"`).
- User is building a Mac UI that needs lists and tables and wants to follow Apple's guidelines.
- User asks to audit or review lists and tables in a macOS design.
- User mentions lists and tables in the context of a Mac app, game, or interface.

A table or list can represent data organized into groups or hierarchies, and it supports user interactions such as selecting, adding, deleting, and reordering. Across all platforms, apps and games use tables to present content and options; many applications employ lists to express an overall information hierarchy, assisting users in navigation. For instance, iOS Settings uses a list hierarchy to help users select options, and several applications—such as Mail in iPadOS and macOS—use a table within a [split view](split-views.md).

When users need to manage complex data, they may require a multicolumn table or spreadsheet view. Productivity applications often utilize tables to represent different data characteristics or attributes in separate, sortable columns.

### Best practices
- **Prefer displaying text in a list or table.** While tables can accommodate any content type, their row-based structure is particularly effective for making text highly readable and scannable. If the items vary greatly in size or if you need to display a large number of images, consider using a [collection](collections.md) instead.
- **Let people edit a table when it makes sense.** Users appreciate the ability to reorder items, even if they are prevented from adding or removing entries. In iOS and iPadOS, users must enter an edit mode before they can select table items.
- **Provide appropriate feedback when people select a list item.** The necessary confirmation varies depending on whether selecting the item reveals a new view or simply toggles the item’s state. Generally, if a table assists users in navigating a hierarchy, it should persistently highlight the selected row to clarify their current path. In contrast, a table that presents options often highlights a row only briefly before adding an image—such as a checkmark—to indicate selection.

### Content
- **Keep item text succinct so row content is comfortable to read.** Brief, concise text helps reduce truncation and wrapping, thereby improving readability and scannability. If an item contains extensive content, explore alternative designs to prevent excessively tall table rows. For instance, display only the item titles and allow users to select an item to view its details in a separate view.
- **Consider ways to preserve readability of text that might otherwise get clipped or truncated.** When a table is constrained in width (for example, if the user can adjust its size), ensure that the content remains recognizable and legible. Using an ellipsis within the text body can sometimes help distinguish an item by preserving both its initial and final content.
- **Use descriptive column headings in a multicolumn table.** Employ nouns or brief noun phrases, following [title-style capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64), and omit terminal punctuation. If a single-column table lacks a column heading, use a label or header to establish context for the user.

### Style
- **Select a table or list style that aligns with your data and platform.** Certain styles incorporate visual elements to communicate hierarchy, grouping, or specific user experiences. For instance, in iOS and iPadOS, the grouped style utilizes headers, footers, and extra spacing to delineate data groups; watchOS offers an elliptical style that makes items appear as if they are scrolling off a curved surface; and macOS defines a bordered style using alternating row backgrounds to enhance usability in large tables. For developer guidance, refer to [ListStyle](apple:SwiftUI/ListStyle).
- **Select a row style that matches the information you intend to present.** You may need to display, for example, a small image at the beginning of a row followed by a concise descriptive label. Some platforms provide native row styles that allow you to arrange content within list rows, headers, and footers using APIs like [UIListContentConfiguration](apple:UIKit/UIListContentConfiguration-swift.struct) when targeting iOS, iPadOS, and tvOS.

## Platform guidance — macOS
- **If beneficial, allow users to click a column header to sort the table view by that column.** If a user clicks on a heading that is already sorted, the data should re-sort in the opposite direction.
- **Allow users to adjust column sizes.** Data displayed within a table view frequently varies in width, and resizing columns helps users focus on specific data areas or reveals information that was previously clipped.
- **Consider applying alternating row colors within a multicolumn table.** Alternating hues can assist users in tracking specific row values across multiple columns, especially when the table is wide.
- **Present hierarchical data using an outline view rather than a table view.** An [outline view](outline-views.md) resembles a table view but includes disclosure triangles that allow users to expose nested levels of data. For example, it could display folders and the items they contain.
