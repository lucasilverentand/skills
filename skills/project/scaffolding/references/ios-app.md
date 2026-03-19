# iOS App

Built with Swift 6.2, SwiftUI, SwiftData, and Tuist. iOS 26 target. Zero third-party dependencies.

## Setup

1. Install Tuist: `curl -Ls https://install.tuist.io | bash`
2. Create project: `tuist init --name MyApp --platform ios`
3. Configure `Project.swift` with targets and deployment target `"26.0"`
4. Generate: `tuist generate`

## Directory structure

```
MyApp/
  Project.swift          # Tuist project definition
  Sources/
    App.swift            # @main entry point
    Models/              # SwiftData models
    Views/               # SwiftUI views, by feature
    ViewModels/          # @Observable view models
    Services/            # Networking, persistence
  Tests/
    MyAppTests.swift     # Swift Testing tests
```

## View models

Use `@Observable` (not `ObservableObject`):

```swift
@Observable
final class SettingsViewModel {
    var email = ""
    var notificationsEnabled = true
}
```

- Use `@State private var viewModel = ...` in views
- Keep views thin — business logic in view models

## Navigation

Use `NavigationStack` with value-based navigation and an `@Observable Router` class with `NavigationPath`.

## SwiftData

```swift
@Model
final class Project {
    var name: String
    var createdAt: Date
    @Relationship(deleteRule: .cascade) var tasks: [Task] = []
}
```

- Use `@Query` in views for read-only display
- Use `modelContext` for mutations
- Do not wrap SwiftData in a repository pattern

## Testing

Use Swift Testing framework:

```swift
import Testing
@testable import MyApp

@Test("Creating a project sets the name")
func createProject() {
    let project = Project(name: "Test")
    #expect(project.name == "Test")
}
```

## Concurrency

- Use Swift structured concurrency (`async`/`await`, `TaskGroup`)
- `@MainActor` for view models updating UI state
- Avoid `DispatchQueue`

## Zero-dependency policy

Use Foundation, SwiftUI, SwiftData, and Apple frameworks. Only exception: dependencies wrapping unavailable system APIs.

## Tools

| Tool | Purpose |
|---|---|
| `tools/target-list.ts` | All Tuist targets with bundle IDs and dependencies |
| `tools/project-audit.ts` | Swift version, deployment target, dependency count |
