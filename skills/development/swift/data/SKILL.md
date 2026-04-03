---
name: data
description: SwiftData persistence for iOS and macOS apps — model design, queries, migrations, ModelContainer setup, @Query, and UserDefaults. Use when designing data models, writing queries, setting up persistence, or handling schema migrations in a SwiftUI app. Trigger phrases: "SwiftData", "ModelContainer", "@Query", "data model", "persistence", "migration", "schema".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Data

## Decision Tree

- What data task?
  - **Designing a data model** → see "Model Design" below
  - **Setting up persistence** → see "Container Setup" below
  - **Querying data in views** → see "Queries" below
  - **Querying data outside views** → see "ModelContext Queries" below
  - **Adding relationships between models** → see "Relationships" below
  - **Schema changed, need migration** → see "Migrations" below
  - **Storing simple preferences** → see "UserDefaults" below
  - **Syncing with CloudKit** → see "CloudKit Sync" below
  - **Testing data layer** → see "Testing" below
  - **Performance issues with large datasets** → see "Performance" below

## Model Design

### Basic model

```swift
@Model
final class Project {
    var name: String
    var summary: String
    var createdAt: Date
    var updatedAt: Date
    var isArchived: Bool

    init(name: String, summary: String = "") {
        self.name = name
        self.summary = summary
        self.createdAt = .now
        self.updatedAt = .now
        self.isArchived = false
    }
}
```

### Conventions

- Every model gets `createdAt` and `updatedAt` timestamps
- Set `updatedAt = .now` explicitly whenever mutating
- Use `final class` — SwiftData requires reference types
- Initialize all properties in `init` — avoid optionals unless the value is genuinely nullable
- Keep model files in a `Models/` directory or colocated with their feature

### Attributes

```swift
@Model
final class Document {
    var title: String

    @Attribute(.unique)
    var slug: String                    // unique constraint

    @Attribute(.externalStorage)
    var imageData: Data?                // large blobs stored outside SQLite

    @Attribute(.spotlight)
    var searchableContent: String       // indexed for Spotlight search

    @Attribute(.ephemeral)
    var previewCache: Data?             // not persisted

    @Transient
    var isSelected = false              // not persisted, not tracked
}
```

### Enums in models

Use `Codable` enums with raw values:

```swift
enum Priority: String, Codable, CaseIterable {
    case low, medium, high, critical
}

@Model
final class Task {
    var title: String
    var priority: Priority

    init(title: String, priority: Priority = .medium) {
        self.title = title
        self.priority = priority
    }
}
```

## Container Setup

### Basic setup

```swift
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

### Custom configuration

```swift
@main
struct MyApp: App {
    let container: ModelContainer

    init() {
        let schema = Schema([Project.self, Task.self])
        let config = ModelConfiguration(
            "MyApp",
            schema: schema,
            isStoredInMemoryOnly: false,
            allowsSave: true
        )

        do {
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(container)
    }
}
```

### Multiple stores

For separating concerns (e.g., user data vs. cache):

```swift
let userData = ModelConfiguration("UserData", schema: Schema([Project.self]))
let cache = ModelConfiguration("Cache", schema: Schema([CacheEntry.self]), isStoredInMemoryOnly: true)

container = try ModelContainer(for: Schema([Project.self, CacheEntry.self]), configurations: [userData, cache])
```

## Queries

### @Query in views

`@Query` provides reactive, auto-updating results:

```swift
struct ProjectListView: View {
    @Query(
        filter: #Predicate<Project> { !$0.isArchived },
        sort: \Project.updatedAt,
        order: .reverse
    )
    private var projects: [Project]

    var body: some View {
        List(projects) { project in
            ProjectRow(project: project)
        }
    }
}
```

### Dynamic queries

Use `init` to configure queries based on parameters:

```swift
struct FilteredProjectList: View {
    @Query private var projects: [Project]

    init(searchText: String, showArchived: Bool) {
        let predicate = #Predicate<Project> { project in
            (searchText.isEmpty || project.name.localizedStandardContains(searchText))
            && (showArchived || !project.isArchived)
        }
        _projects = Query(filter: predicate, sort: \.updatedAt, order: .reverse)
    }

    var body: some View {
        List(projects) { project in
            ProjectRow(project: project)
        }
    }
}
```

### Sort descriptors

```swift
@Query(sort: [
    SortDescriptor(\Project.isArchived),          // active first
    SortDescriptor(\Project.updatedAt, order: .reverse)  // then by recent
])
private var projects: [Project]
```

## ModelContext Queries

For querying outside of views (in view models, services, etc.):

```swift
@Observable @MainActor
final class ProjectService {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func fetchActive() throws -> [Project] {
        let predicate = #Predicate<Project> { !$0.isArchived }
        let descriptor = FetchDescriptor<Project>(
            predicate: predicate,
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        return try context.fetch(descriptor)
    }

    func fetchCount() throws -> Int {
        let descriptor = FetchDescriptor<Project>(
            predicate: #Predicate { !$0.isArchived }
        )
        return try context.fetchCount(descriptor)
    }
}
```

### CRUD operations

```swift
// Create
let project = Project(name: "New Project")
context.insert(project)

// Update
project.name = "Updated Name"
project.updatedAt = .now
// SwiftData auto-saves — no explicit save needed in most cases

// Delete
context.delete(project)

// Explicit save (for critical writes)
try context.save()
```

### Getting the context

```swift
// In a view
@Environment(\.modelContext) private var context

// From a container (e.g., in a service)
let context = container.mainContext
```

## Relationships

### One-to-many

```swift
@Model
final class Project {
    var name: String
    @Relationship(deleteRule: .cascade)
    var tasks: [Task] = []
}

@Model
final class Task {
    var title: String
    var project: Project?
}
```

### Delete rules

| Rule | Behavior |
|---|---|
| `.cascade` | Deleting parent deletes all children |
| `.nullify` | Deleting parent sets child's reference to nil (default) |
| `.deny` | Prevents deletion if children exist |
| `.noAction` | Does nothing — can leave orphans |

Use `.cascade` for strong ownership (project → tasks). Use `.nullify` for loose associations.

### Many-to-many

```swift
@Model
final class Tag {
    var name: String
    var projects: [Project] = []
}

@Model
final class Project {
    var name: String
    var tags: [Tag] = []
}
```

SwiftData manages the join table automatically.

## Migrations

### Lightweight migration

SwiftData handles simple changes automatically:
- Adding a new property with a default value
- Removing a property
- Adding a new model

No code needed — just change the model and SwiftData migrates.

### Versioned schema migration

For non-trivial changes (renaming, data transforms):

```swift
enum ProjectSchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)
    static var models: [any PersistentModel.Type] { [Project.self] }

    @Model
    final class Project {
        var name: String
        var created: Date
    }
}

enum ProjectSchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)
    static var models: [any PersistentModel.Type] { [Project.self] }

    @Model
    final class Project {
        var name: String
        var summary: String
        var createdAt: Date   // renamed from 'created'
    }
}

enum ProjectMigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] {
        [ProjectSchemaV1.self, ProjectSchemaV2.self]
    }

    static var stages: [MigrationStage] {
        [migrateV1toV2]
    }

    static let migrateV1toV2 = MigrationStage.custom(
        fromVersion: ProjectSchemaV1.self,
        toVersion: ProjectSchemaV2.self
    ) { context in
        // Data transforms here
        let projects = try context.fetch(FetchDescriptor<ProjectSchemaV2.Project>())
        for project in projects {
            project.summary = ""
        }
        try context.save()
    }
}
```

Register the migration plan:

```swift
container = try ModelContainer(
    for: Project.self,
    migrationPlan: ProjectMigrationPlan.self
)
```

## UserDefaults

For simple key-value preferences that don't need SwiftData:

```swift
// In views — reactive via @AppStorage
@AppStorage("theme") private var theme = "system"
@AppStorage("showWelcome") private var showWelcome = true

// In models/services — direct UserDefaults access
let defaults = UserDefaults.standard
defaults.set("dark", forKey: "theme")
let theme = defaults.string(forKey: "theme") ?? "system"
```

### When to use UserDefaults vs SwiftData

| Use case | Storage |
|---|---|
| User preferences (theme, font size, sidebar visibility) | `@AppStorage` / UserDefaults |
| Feature flags, first-launch state | UserDefaults |
| Domain models, structured data | SwiftData |
| Lists of items, searchable content | SwiftData |
| Anything relational | SwiftData |

## CloudKit Sync

### Basic setup

```swift
let config = ModelConfiguration(
    "MyApp",
    schema: schema,
    cloudKitDatabase: .private("iCloud.com.yourcompany.appname")
)
```

### CloudKit constraints

- All properties must be optional or have default values (CloudKit doesn't guarantee all fields sync)
- Unique constraints don't work with CloudKit
- Delete rules behave differently — `.cascade` may not propagate immediately
- Test sync behavior on real devices — the simulator's CloudKit behavior differs

## Testing

### In-memory container for tests

```swift
@Test func creatingProjectInsertsIntoStore() throws {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try ModelContainer(for: Project.self, configurations: [config])
    let context = container.mainContext

    let project = Project(name: "Test")
    context.insert(project)
    try context.save()

    let fetched = try context.fetch(FetchDescriptor<Project>())
    #expect(fetched.count == 1)
    #expect(fetched.first?.name == "Test")
}
```

### Testing predicates

```swift
@Test func predicateFiltersArchived() throws {
    let container = try ModelContainer(
        for: Project.self,
        configurations: [ModelConfiguration(isStoredInMemoryOnly: true)]
    )
    let context = container.mainContext

    context.insert(Project(name: "Active"))
    let archived = Project(name: "Archived")
    archived.isArchived = true
    context.insert(archived)
    try context.save()

    let predicate = #Predicate<Project> { !$0.isArchived }
    let results = try context.fetch(FetchDescriptor(predicate: predicate))
    #expect(results.count == 1)
    #expect(results.first?.name == "Active")
}
```

## Performance

- Use `fetchLimit` on `FetchDescriptor` to avoid loading everything
- Use `fetchCount` when you only need the count
- Use `.prefetchedRelationships` to avoid N+1 when accessing relationships
- Use `@Attribute(.externalStorage)` for large binary data (images, files)
- Use `@Transient` for computed or cached values that don't need persistence
- Batch deletes: `try context.delete(model: Project.self, where: predicate)` instead of fetching and deleting one by one
- Profile with Instruments → Core Data template (SwiftData uses Core Data under the hood)
