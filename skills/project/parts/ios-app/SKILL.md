---
name: ios-app
description: Sets up and maintains an iOS app using Swift 6.2, SwiftUI, and Tuist. Handles project structure, SwiftData persistence, navigation, Swift Testing, and zero-dependency architecture. Use when creating a new iOS app, adding features, configuring Tuist, writing tests, or debugging SwiftUI views.
allowed-tools: Read Write Edit Glob Grep Bash
---

# iOS App

The iOS app is built with Swift 6.2 targeting iOS 26. Uses SwiftUI with `@Observable` for state, SwiftData for persistence, and Tuist for project management. Zero third-party dependencies unless absolutely necessary.

## Decision Tree

- What are you doing?
  - **Creating a new iOS app** → see "Initial setup" below
  - **Adding a feature / screen** → see "Adding features" below
  - **Adding persistence** → see "SwiftData" below
  - **Writing tests** → see "Testing" below
  - **Configuring Tuist** → see "Tuist" below
  - **Listing all targets** → run `tools/target-list.ts`
  - **Checking project health** → run `tools/project-audit.ts`

## Initial setup

1. Install Tuist: `curl -Ls https://install.tuist.io | bash`
2. Create project: `tuist init --name MyApp --platform ios`
3. Configure `Project.swift`:

```swift
import ProjectDescription

let project = Project(
    name: "MyApp",
    targets: [
        .target(
            name: "MyApp",
            destinations: .iOS,
            product: .app,
            bundleId: "com.example.myapp",
            deploymentTargets: .iOS("26.0"),
            sources: ["Sources/**"],
            resources: ["Resources/**"],
            dependencies: []
        ),
        .target(
            name: "MyAppTests",
            destinations: .iOS,
            product: .unitTests,
            bundleId: "com.example.myapp.tests",
            sources: ["Tests/**"],
            dependencies: [.target(name: "MyApp")]
        ),
    ]
)
```

4. Generate Xcode project: `tuist generate`
5. Confirm Swift 6.2 language mode in build settings

## Directory structure

```
MyApp/
  Project.swift          # Tuist project definition
  Tuist/
    Config.swift         # Tuist configuration
  Sources/
    App.swift            # @main entry point
    Models/              # SwiftData models, domain types
    Views/               # SwiftUI views, organized by feature
    ViewModels/          # @Observable view models
    Services/            # Networking, persistence, system services
    Extensions/          # Swift extensions
  Resources/
    Assets.xcassets      # Images, colors
    Localizable.xcstrings
  Tests/
    MyAppTests.swift     # Swift Testing tests
```

## Adding features

Each feature gets its own directory under `Views/`:

```swift
// Sources/Views/Settings/SettingsView.swift
import SwiftUI

struct SettingsView: View {
    @State private var viewModel = SettingsViewModel()

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    LabeledContent("Email", value: viewModel.email)
                }
                Section("Preferences") {
                    Toggle("Notifications", isOn: $viewModel.notificationsEnabled)
                }
            }
            .navigationTitle("Settings")
        }
    }
}
```

### View models

Use `@Observable` (not `ObservableObject`):

```swift
// Sources/ViewModels/SettingsViewModel.swift
import Observation

@Observable
final class SettingsViewModel {
    var email = ""
    var notificationsEnabled = true

    func loadSettings() {
        // fetch from persistence or API
    }
}
```

- `@Observable` is the modern replacement for `ObservableObject` + `@Published`
- Use `@State private var viewModel = ...` in the view — no `@StateObject`
- Keep views thin — business logic goes in the view model

### Navigation

Use `NavigationStack` with value-based navigation:

```swift
@Observable
final class Router {
    var path = NavigationPath()

    func navigate(to destination: Destination) {
        path.append(destination)
    }
}

enum Destination: Hashable {
    case detail(id: String)
    case settings
}
```

- Define a `Router` as an `@Observable` class
- Use `navigationDestination(for:)` for type-safe routing
- Avoid deeply nested `NavigationLink` — use programmatic navigation

## SwiftData

### Model definition

```swift
import SwiftData

@Model
final class Project {
    var name: String
    var createdAt: Date
    @Relationship(deleteRule: .cascade)
    var tasks: [Task] = []

    init(name: String) {
        self.name = name
        self.createdAt = .now
    }
}
```

### Container setup

```swift
// App.swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Project.self, Task.self])
    }
}
```

### Querying

Use `@Query` in views:

```swift
struct ProjectListView: View {
    @Query(sort: \Project.createdAt, order: .reverse)
    private var projects: [Project]

    var body: some View {
        List(projects) { project in
            Text(project.name)
        }
    }
}
```

- Use `@Query` for read-only display
- Use `modelContext.insert()`, `.delete()`, `.save()` for mutations
- Do not wrap SwiftData in a repository pattern — use it directly

## Testing

Use Swift Testing framework — not XCTest:

```swift
import Testing
@testable import MyApp

@Test("Creating a project sets the name and date")
func createProject() {
    let project = Project(name: "Test")
    #expect(project.name == "Test")
    #expect(project.createdAt <= .now)
}

@Test("ViewModel loads settings from storage")
func loadSettings() async {
    let vm = SettingsViewModel()
    await vm.loadSettings()
    #expect(!vm.email.isEmpty)
}
```

- Use `@Test` with a descriptive string, not method naming conventions
- Use `#expect()` for assertions — not `XCTAssert`
- Use `@Suite` to group related tests
- Use `async` tests for asynchronous operations
- Run with `swift test` or through Xcode

## Concurrency

- Use Swift structured concurrency (`async`/`await`, `TaskGroup`)
- Mark actors where shared mutable state is needed
- Use `@MainActor` for view models that update UI state
- Avoid `DispatchQueue` — use modern concurrency primitives

## Zero-dependency policy

- Use Foundation, SwiftUI, SwiftData, and other Apple frameworks
- Use Swift packages from Apple (e.g. swift-algorithms, swift-collections) when needed
- Avoid third-party dependencies — write it yourself or use system frameworks
- Only exception: dependencies that wrap unavailable system APIs (rare)

## Key references

| File | What it covers |
|---|---|
| `tools/target-list.ts` | List all Tuist targets with bundle IDs and dependencies |
| `tools/project-audit.ts` | Check project health: Swift version, deployment target, dependency count |
