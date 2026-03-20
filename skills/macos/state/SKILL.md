---
name: state
description: SwiftUI state management for macOS apps — @Observable, @State, @Environment, @Binding, @AppStorage, and @MainActor patterns. Use when choosing state primitives, designing observable models, wiring up environment dependencies, or debugging state issues. Trigger phrases: "state management", "@Observable", "@State", "@Environment", "observable model", "state not updating".
allowed-tools: Read Grep Glob Bash Write Edit
---

# State

## Decision Tree

- What state task?
  - **Choosing the right state primitive** → see "Which Primitive" below
  - **Designing an @Observable model** → see "Observable Models" below
  - **Injecting dependencies via Environment** → see "Environment" below
  - **Passing state to child views** → see "Binding" below
  - **Persisting user preferences** → see "AppStorage" below
  - **State not updating / view not re-rendering** → see "Debugging State" below
  - **Handling async state updates** → see "Async State" below
  - **Structuring state for testability** → see "Testable State" below

## Which Primitive

| Primitive | Owner | Scope | Use when |
|---|---|---|---|
| `@State` | The view | View-local | Simple value types owned by this view (toggles, text fields, selection) |
| `@Binding` | Parent view | Passed down | Child needs read-write access to parent's `@State` |
| `@Observable` class | You | Shared | Model with business logic shared across views |
| `@Environment` | SwiftUI | Subtree | Injecting shared dependencies (router, services, settings) |
| `@AppStorage` | UserDefaults | App-wide | Small user preferences that persist across launches |
| `let` / plain property | Parent | Passed down | Read-only data — no reactivity needed |

### Decision flow

1. Is it a simple toggle, text input, or selection state? → `@State`
2. Does a child view need to mutate the parent's state? → `@Binding`
3. Is it a model with business logic or shared across multiple views? → `@Observable` class
4. Should it be available to an entire view subtree without explicit passing? → `@Environment`
5. Should it survive app relaunch? → `@AppStorage` (simple values) or SwiftData (complex data)
6. Is it read-only data passed from parent? → Plain `let` property

## Observable Models

### Basic pattern

```swift
@Observable
final class ProjectViewModel {
    var projects: [Project] = []
    var selectedProject: Project?
    var isLoading = false
    var error: Error?

    private let store: ProjectStore

    init(store: ProjectStore) {
        self.store = store
    }

    func loadProjects() async {
        isLoading = true
        defer { isLoading = false }

        do {
            projects = try await store.fetchAll()
        } catch {
            self.error = error
        }
    }

    func delete(_ project: Project) async {
        do {
            try await store.delete(project)
            projects.removeAll { $0.id == project.id }
        } catch {
            self.error = error
        }
    }
}
```

### Using in views

```swift
struct ProjectListView: View {
    @State private var viewModel: ProjectViewModel

    init(store: ProjectStore) {
        _viewModel = State(initialValue: ProjectViewModel(store: store))
    }

    var body: some View {
        List(viewModel.projects, selection: $viewModel.selectedProject) { project in
            ProjectRow(project: project)
        }
        .task { await viewModel.loadProjects() }
        .overlay {
            if viewModel.isLoading { ProgressView() }
        }
    }
}
```

### Rules for @Observable

- Mark classes `@Observable` — not structs (structs use `@State` directly)
- Use `final class` — subclassing observable models creates confusion
- Only properties that are read in `body` trigger re-renders — SwiftUI tracks access automatically
- Use `@ObservationIgnored` for properties that shouldn't trigger view updates:

```swift
@Observable
final class ViewModel {
    var displayName: String = ""     // triggers re-render
    @ObservationIgnored
    var internalCache: [String: Data] = [:]  // does not
}
```

## Environment

### Injecting dependencies

Define an `EnvironmentKey` and inject at the root:

```swift
// Define the key
struct RouterKey: EnvironmentKey {
    static let defaultValue = Router()
}

extension EnvironmentValues {
    var router: Router {
        get { self[RouterKey.self] }
        set { self[RouterKey.self] = newValue }
    }
}

// Inject at root
@main
struct MyApp: App {
    @State private var router = Router()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(router)
        }
    }
}

// Consume in any descendant
struct DetailView: View {
    @Environment(Router.self) private var router
    // ...
}
```

### When to use Environment vs. init parameters

- **Environment**: services, routers, shared state, theme — things used by many views at different depths
- **Init parameters**: data specific to this view, direct parent-child communication

Don't over-use Environment. If only one child needs the value, pass it directly.

### @Observable with @Environment

`@Observable` classes can be placed directly into the environment without defining a custom key:

```swift
@Observable
final class AppState {
    var currentUser: User?
    var theme: Theme = .system
}

// Inject
ContentView()
    .environment(appState)

// Consume
@Environment(AppState.self) private var appState
```

## Binding

### Basics

`@Binding` creates a two-way connection to a source of truth owned elsewhere:

```swift
struct ToggleRow: View {
    let title: String
    @Binding var isOn: Bool

    var body: some View {
        Toggle(title, isOn: $isOn)
    }
}

// Parent
@State private var notificationsEnabled = true

ToggleRow(title: "Notifications", isOn: $notificationsEnabled)
```

### Binding to @Observable properties

Use `@Bindable` to create bindings from `@Observable` objects:

```swift
struct EditorView: View {
    @Bindable var document: Document  // Document is @Observable

    var body: some View {
        TextField("Title", text: $document.title)
    }
}
```

### Computed bindings

Create custom bindings for transformation or validation:

```swift
var uppercasedBinding: Binding<String> {
    Binding(
        get: { viewModel.name.uppercased() },
        set: { viewModel.name = $0 }
    )
}
```

## AppStorage

For small, simple preferences that persist across app launches:

```swift
struct SettingsView: View {
    @AppStorage("showSidebar") private var showSidebar = true
    @AppStorage("fontSize") private var fontSize = 14.0
    @AppStorage("accentColorName") private var accentColorName = "blue"

    var body: some View {
        Form {
            Toggle("Show Sidebar", isOn: $showSidebar)
            Slider(value: $fontSize, in: 10...24, step: 1) {
                Text("Font Size: \(Int(fontSize))")
            }
        }
    }
}
```

### Rules

- Only use for simple types: `Bool`, `Int`, `Double`, `String`, `URL`, `Data`
- For `Codable` types, encode to `Data` — but prefer SwiftData for anything complex
- Keys are stringly typed — define constants to avoid typos:

```swift
enum StorageKey {
    static let showSidebar = "showSidebar"
    static let fontSize = "fontSize"
}

@AppStorage(StorageKey.showSidebar) private var showSidebar = true
```

- Don't store large data, sensitive data, or frequently changing data in UserDefaults

## Async State

### @MainActor

Observable models that update UI state should be on `@MainActor`:

```swift
@Observable @MainActor
final class SearchViewModel {
    var query = ""
    var results: [SearchResult] = []
    var isSearching = false

    func search() async {
        isSearching = true
        defer { isSearching = false }

        results = await SearchService.search(query)
    }
}
```

### Task management

Use `.task` for async work tied to a view's lifetime — it cancels automatically:

```swift
var body: some View {
    List(results) { result in
        ResultRow(result: result)
    }
    .task(id: query) {
        // Re-runs when query changes, cancels previous
        await viewModel.search(query)
    }
}
```

### Debouncing

For search-as-you-type, debounce with `Task.sleep`:

```swift
func search(_ query: String) async {
    try? await Task.sleep(for: .milliseconds(300))

    guard !Task.isCancelled else { return }

    // Proceed with search...
}
```

Combined with `.task(id: query)`, this naturally debounces because each keystroke cancels the previous task.

## Testable State

### Separate models from views

Keep business logic in `@Observable` models, not in views. This makes state testable without instantiating views:

```swift
@Test func deletingProjectRemovesItFromList() async {
    let store = MockProjectStore(projects: [.sample])
    let viewModel = ProjectViewModel(store: store)

    await viewModel.loadProjects()
    #expect(viewModel.projects.count == 1)

    await viewModel.delete(.sample)
    #expect(viewModel.projects.isEmpty)
}
```

### Protocol-based dependencies

Inject dependencies as protocols so tests can substitute fakes:

```swift
protocol ProjectStoring: Sendable {
    func fetchAll() async throws -> [Project]
    func delete(_ project: Project) async throws
}

// Production
struct ProjectStore: ProjectStoring { ... }

// Test
struct MockProjectStore: ProjectStoring { ... }
```

## Debugging State

When state isn't updating as expected:

1. **Verify ownership** — is the `@State` declared in the right view? State in a child that gets recreated will reset
2. **Check @Observable tracking** — only properties read inside `body` trigger updates. If you read a property in `onAppear` but not `body`, changes won't re-render
3. **Check reference vs value** — `@State` with a class reference doesn't track property changes; use `@Observable` instead
4. **MainActor** — updates from background tasks won't appear until dispatched to main. Use `@MainActor` on your model
5. **@Bindable missing** — if binding to an `@Observable` property, you need `@Bindable var model` not just `let model`
6. **Print tracking** — use `let _ = Self._printChanges()` at the top of `body` to see what triggered a re-render
