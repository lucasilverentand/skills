# Search fields — full guidelines
For development instructions, consult [Adding a search interface to your app](apple:SwiftUI/Adding-a-search-interface-to-your-app); for information regarding system-wide search, refer to **Searching**.

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
- **Employ tokens to filter using frequent search terms or specific items.** When a token is established, the term it represents receives a visual treatment that encapsulates it, indicating it can be selected and edited as a single unit. Tokens clarify search queries—such as filtering by a particular contact in Mail—or focus searches on specific attributes, like selecting photos in Messages. For the related macOS implementation, refer to **Token fields**.
- **Consider pairing tokens with search suggestions.** Since users may be unaware of available tokens, combining them with search suggestions aids in their adoption and usage.

## Platform guidance — iOS & iPadOS
Search functionality can be accessed from three primary locations:

- Within a tab bar at the bottom of the screen.
- In a toolbar, positioned either at the top or bottom of the screen.
- Directly integrated within the content itself.

The most appropriate placement for search depends entirely on your application's layout, content structure, and navigation design.

##### Search in a tab bar
Search can be implemented as a visually unique tab on the trailing edge of a tab bar, ensuring that search remains visible and accessible while users navigate between your app's sections.

Upon entering the search tab, the displayed search field may be initialized in either a *focused* or *unfocused* state.

- **Initialize the search field focused to facilitate rapid information retrieval.** When the search field begins in a focused state, the keyboard appears instantly with the search input area above it, ready for input. This approach offers a more transient experience, returning users directly to their previous tab upon exiting search, and is optimal when the goal is a swift and seamless resolution via search.
- **Initialize the search field unfocused to encourage discovery and browsing.** If the search field starts unfocused, the search tab expands into an unselected input area at the bottom of the screen. This provides valuable screen real estate for further exploration or navigation before a user taps the field to initiate a search. This pattern is highly suitable for applications featuring extensive content collections, such as those dedicated to Music or TV.

##### Search in a toolbar
Search functionality can be located in a toolbar, either at the bottom or top of the screen, offering an alternative to using search within a tab bar.

- In a bottom toolbar, search can be included as either an expanded field or a dedicated toolbar button. The specific choice depends on the available screen space and how critical search is to the application. When activated, it transitions into a searchable input field positioned above the keyboard.
- In a top toolbar (also known as a navigation bar), search appears initially as a toolbar button. Tapping this button causes it to animate into a searchable field that displays either above the keyboard or inline at the top if there is no dedicated space below.
- **Place search at the bottom when screen real estate allows.** You have the option to integrate a search field into an existing toolbar or establish a new toolbar dedicated solely to search. Placing search at the bottom is beneficial whenever it constitutes a high priority, as this placement ensures easy accessibility. Examples of applications utilizing bottom search across different toolbar configurations include Settings (where it is the sole item) and Mail and Notes, where it complements other essential controls.
- **Place search at the top when deferring to screen content below is critical, or if no bottom toolbar exists.** Use top search in scenarios where the visual overlay of a search interface might impede a primary function of the application. For instance, the Wallet app maintains event passes in a stack at the bottom of the screen for effortless viewing and quick access.

##### Search as an inline field
In certain scenarios, your application may benefit from including a search field that appears inline with the content.

- **Place search as an inline field when its position alongside the content it searches strengthens that relationship.** If you require users to filter or search within a single view, displaying the search directly adjacent to the content helps clarify that the search scope is local rather than global. For instance, while the primary search in the Music app resides in the tab bar, users can utilize an inline search field within their library view to narrow down songs and albums.
- **Prefer placing search at the bottom.** Typically, even if the search targets only a portion of your app's content, it is best to position the search where users can readily access it. The Settings app demonstrates this by placing search at the bottom for both its main function and searches within individual application sections. If available space at the bottom is unavailable (due to a tab bar or other critical UI element, for example), placing search inline at the top is acceptable.
- **When at the top, position an inline search field above the list it searches, and pin it to the top toolbar when scrolling.** This approach helps differentiate it from search features found elsewhere in the app.
