---
name: search-fields
description: "A search field allows users to locate specific content within a collection using entered terms. Use when designing search fields for watchOS, auditing search fields against Apple's watchOS guidelines, or when the user says things like \"design search fields for Apple Watch\", \"search fields on watchOS\", \"how should search fields work on Apple Watch\"."
allowed-tools: Read Grep Glob
---

# Search fields
A search field allows users to locate specific content within a collection using entered terms

## When to use
- User asks about **search fields** on watchOS (e.g. `"how do I design search fields for Apple Watch"`).
- User is building an Apple Watch UI that needs search fields and wants to follow Apple's guidelines.
- User asks to audit or review search fields in a watchOS design.
- User mentions search fields in the context of an Apple Watch app, game, or interface.

A search field is an editable text input that displays a Search icon, a Clear button, and placeholder text where users can type their query. Search fields may utilize [Scope controls and tokens](#Scope-controls-and-tokens) as well as [Scope controls and tokens](#Scope-controls-and-tokens) to assist in filtering and narrowing the search scope. The method for accessing search varies across platforms, depending on your application's goals and design.

For development instructions, consult [Adding a search interface to your app](apple:SwiftUI/Adding-a-search-interface-to-your-app); for information regarding system-wide search, refer to [Searching](searching.md).

### Best practices
- **Display placeholder text that conveys the searchable content type.** For instance, the Apple TV application uses the prompt *Shows, Movies, and More*. Avoid using generic terms like *Search* in placeholder text, as this offers no guidance to the user.
- **Initiate searching immediately upon user input, if technically feasible.** Searching dynamically as text is entered enhances responsiveness by providing results that are continuously refined with increasing specificity.
- **Consider displaying suggested search queries before the search begins, or while the user is typing.** Suggesting common searches accelerates the discovery process, even if the search execution is delayed.
- **Streamline search results.** Display the most pertinent matches initially to reduce scrolling required by the user. Beyond prioritizing likely outcomes, consider segmenting results into categories to aid navigation.
- **Consider enabling users to refine search outcomes.** For example, incorporating a scope control within the results view allows users to quickly and easily narrow down their findings.

### Scope controls and tokens
Scope controls and tokens are features that allow users to restrict search parameters either before or after executing a search.

- A *scope control* functions similarly to [Segmented controls](segmented-controls.md) when selecting a search category.
- A *token* is the visual display of a search term that users can select and modify, serving as a filter for any additional terms in the query.
- **Utilize a scope control to narrow searches within clearly defined categories.** A scope control assists users in transitioning from a wide search area to a more focused one. For instance, within Mail on iPhone, it enables users to shift from searching their entire mailbox to only the specific mailbox they are currently viewing. For guidance on implementation, consult [Scoping a search operation](apple:SwiftUI/Scoping-a-search-operation).
- **Begin with a broad scope and allow users to refine it as needed.** A wider initial scope provides context for the complete set of potential results, effectively guiding users when they decide to narrow their focus.
- **Employ tokens to filter using frequent search terms or specific items.** When a token is established, the term it represents receives a visual treatment that encapsulates it, indicating it can be selected and edited as a single unit. Tokens clarify search queries—such as filtering by a particular contact in Mail—or focus searches on specific attributes, like selecting photos in Messages. For the related macOS implementation, refer to [Token fields](token-fields.md).
- **Consider pairing tokens with search suggestions.** Since users may be unaware of available tokens, combining them with search suggestions aids in their adoption and usage.

## Platform guidance — watchOS
Upon activating the search field, a full-screen text input control is presented. The application returns to the search interface exclusively after the user selects either Cancel or Search.
