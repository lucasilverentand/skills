---
name: searching
description: "Users employ diverse methods to locate information across their device, within a specific application, or inside a document or file. Use when designing searching for tvOS, auditing searching against Apple's tvOS guidelines, or when the user says things like \"design searching for Apple TV\", \"searching on tvOS\", \"how should searching work on Apple TV\"."
allowed-tools: Read Grep Glob
---

# Searching
Users employ diverse methods to locate information across their device, within a specific application, or inside a document or file

## When to use
- User asks about **searching** on tvOS (e.g. `"how do I design searching for Apple TV"`).
- User is building an Apple TV UI that needs searching and wants to follow Apple's guidelines.
- User asks to audit or review searching in a tvOS design.
- User mentions searching in the context of an Apple TV app, game, or interface.

When searching for content inside an app, users typically anticipate utilizing the [Search fields](search-fields.md). Where appropriate, you can enhance the search experience by leveraging your understanding of how users interact with your application. For instance, you could display recent queries, suggested searches, completions, or corrections based on terms previously searched within your app.

In certain scenarios, users value the ability to narrow or refine a search. For example, they might wish to locate items by defining attributes such as creation date, file size, or file type. Refer to [Scope controls and tokens](search-fields.md#Scope-controls-and-tokens) for guidance on this feature. You can also assist users in locating content within an open document or file by implementing mechanisms to find information within a window or page in your iOS, iPadOS, or macOS application.

On iOS, iPadOS, and macOS, Spotlight assists users in finding content across the entire system and on the web. By indexing and supplying information about your app's content, users can utilize Spotlight to discover content contained within your application without needing to launch it first. See [Systemwide search](#Systemwide-search) for detailed instructions.

### Best practices
- **If search is important, consider making it a primary action.** For instance, the iOS versions of Apple TV, Photos, and Phone dedicate a specific tab to search within the [Tab bars](tab-bars.md). Similarly, the Notes app incorporates a search field within the [Toolbars](toolbars.md), ensuring its high visibility and easy access.
- **Aim to make your app’s content searchable through a single location.** Users value having one clearly defined place from which they can locate anything within your application. While a local search may still be beneficial for apps with distinct sections, centralizing the search function is key. For example, in the iOS Phone app, searching functions as a filter when viewing Recents and Contacts.
- **Use placeholder text to indicate what content is searchable.** For example, the Apple TV app utilizes the placeholder text *Shows, Movies, and More*.
- **Clearly display the current scope of a search.** Use descriptive placeholder text, [Scope controls and tokens](search-fields.md#Scope-controls-and-tokens), or a title to reinforce what the user is currently searching. For instance, the Mail app always provides explicit reference to the mailbox being searched.
- **Provide suggestions to make searching easier.** Offering search suggestions, whether based on recent searches or while the user is typing, helps users find information faster and reduces input required. For guidance on implementation, consult [searchSuggestions(_:)](apple:SwiftUI/View/searchSuggestions(_:)).
- **Take privacy into consideration before displaying search history.** Users may object to their search history being visible to others. Depending on the context, consider alternative methods for narrowing searches. If you do display search history, ensure users have a mechanism to clear it if desired.

### Systemwide search
- **Make your app’s content searchable in Spotlight.** To share content with Spotlight, you must make it indexable and define descriptive attributes known as *metadata*. Spotlight is responsible for extracting, storing, and organizing this information to enable fast, comprehensive searches.
- **Define metadata for custom file types you handle.** Supply a Spotlight File Importer plug-in that describes the specific metadata contained within your file format. For developer guidance, consult [CSImportExtension](apple:CoreSpotlight/CSImportExtension).
- **Use Spotlight to offer advanced file-search capabilities within the context of your app.** For example, you might include a button that instantly initiates a Spotlight search based on the current selection. You could then display a custom view presenting either the full search results or a filtered subset of them.
- **Prefer using the system-provided open and save views.** The operating system's default open and save views usually feature a built-in search field that users can employ to filter and search the entire system. See [File management](file-management.md) for relevant guidance.
- **Implement a Quick Look generator if your app produces custom file types.** A Quick Look generator assists Spotlight and other applications in displaying previews of the documents your app creates. For developer guidance, refer to [Quick Look](apple:QuickLook).
