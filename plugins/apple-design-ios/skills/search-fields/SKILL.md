---
name: search-fields
description: "A search field allows users to locate specific content within a collection using entered terms. Use when designing search fields for iOS and iPadOS, auditing search fields against Apple's iOS and iPadOS guidelines, or when the user says things like \"design search fields for iPhone\", \"search fields on iOS and iPadOS\", \"how should search fields work on iPhone\"."
allowed-tools: Read Grep Glob
---

# Search fields
A search field allows users to locate specific content within a collection using entered terms

## When to use
- User asks about **search fields** on iOS and iPadOS (e.g. `"how do I design search fields for iPhone"`).
- User is building an iPhone UI that needs search fields and wants to follow Apple's guidelines.
- User asks to audit or review search fields in an iOS and iPadOS design.
- User mentions search fields in the context of an iPhone app, game, or interface.

## Quick principles
- **Display placeholder text that conveys the searchable content type** — For instance, the Apple TV application uses the prompt *Shows, Movies, and More*
- **Initiate searching immediately upon user input, if technically feasible** — Searching dynamically as text is entered enhances responsiveness by providing results that are continuously refined with increasing specificity
- **Consider displaying suggested search queries before the search begins, or while the user is typing** — Suggesting common searches accelerates the discovery process, even if the search execution is delayed
- **Streamline search results** — Display the most pertinent matches initially to reduce scrolling required by the user
- **Consider enabling users to refine search outcomes** — For example, incorporating a scope control within the results view allows users to quickly and easily narrow down their findings
- **Utilize a scope control to narrow searches within clearly defined categories** — A scope control assists users in transitioning from a wide search area to a more focused one
- **Begin with a broad scope and allow users to refine it as needed** — A wider initial scope provides context for the complete set of potential results, effectively guiding users when they decide to narrow their…
- **Employ tokens to filter using frequent search terms or specific items** — When a token is established, the term it represents receives a visual treatment that encapsulates it, indicating it can be selected and…
- **Consider pairing tokens with search suggestions** — Since users may be unaware of available tokens, combining them with search suggestions aids in their adoption and usage
- **Initialize the search field focused to facilitate rapid information retrieval** — When the search field begins in a focused state, the keyboard appears instantly with the search input area above it, ready for…
- **Initialize the search field unfocused to encourage discovery and browsing** — If the search field starts unfocused, the search tab expands into an unselected input area at the bottom of the screen
- **Place search at the bottom when screen real estate allows** — You have the option to integrate a search field into an existing toolbar or establish a new toolbar dedicated solely to search

## Full guidance
Read the referenced files for the complete Apple guidance on this topic:
- @references/guidelines.md
