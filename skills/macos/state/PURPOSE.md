# State

SwiftUI state management patterns for macOS apps — @Observable, @State, @Environment, @Binding, and @AppStorage.

## Responsibilities

- Choose the correct state primitive for each use case
- Design @Observable model types with clean separation of concerns
- Wire up @Environment for dependency injection
- Use @Binding to create two-way connections between parent and child views
- Persist user preferences with @AppStorage
- Avoid common pitfalls: unnecessary re-renders, reference vs value semantics
- Structure observable models for testability
- Handle async state updates on @MainActor
