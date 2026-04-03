---
name: patterns
description: macOS-specific SwiftUI patterns — window management, MenuBarExtra, Settings scenes, toolbars, menu commands, keyboard shortcuts, sandboxing, and AppKit interop. Use when building macOS app chrome, managing windows, adding menu bar items, configuring entitlements, or bridging to AppKit. Trigger phrases: "macOS app", "MenuBarExtra", "Settings", "toolbar", "keyboard shortcut", "NSViewRepresentable", "sandboxing", "entitlements", "window management".
allowed-tools: Read Grep Glob Bash Write Edit
---

# macOS Patterns

## Decision Tree

- What macOS task?
  - **Structuring the app entry point** → see "App Structure" below
  - **Managing windows** → see "Window Management" below
  - **Adding a menu bar item** → see "MenuBarExtra" below
  - **Building the Settings window** → see "Settings" below
  - **Adding toolbar items** → see "Toolbars" below
  - **Adding keyboard shortcuts / menu commands** → see "Commands" below
  - **Bridging to AppKit** → see "AppKit Interop" below
  - **Configuring entitlements / sandboxing** → see "Sandboxing" below
  - **Handling file access** → see "File Access" below
  - **Drag and drop** → see "Drag and Drop" below

## App Structure

### Basic macOS app

```swift
@main
struct MyApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
        }
        .defaultSize(width: 900, height: 600)

        Settings {
            SettingsView()
                .environment(appState)
        }
    }
}
```

### App with sidebar navigation

The standard macOS pattern — `NavigationSplitView` with sidebar + detail:

```swift
struct ContentView: View {
    @State private var selection: NavigationItem? = .projects

    var body: some View {
        NavigationSplitView {
            Sidebar(selection: $selection)
        } detail: {
            switch selection {
            case .projects:
                ProjectsView()
            case .settings:
                InlineSettingsView()
            case nil:
                ContentUnavailableView("Select an item", systemImage: "sidebar.left")
            }
        }
    }
}
```

### NavigationSplitView with three columns

For apps that need a list + detail pattern (mail-style):

```swift
NavigationSplitView {
    Sidebar(selection: $selectedCategory)
} content: {
    ItemList(category: selectedCategory, selection: $selectedItem)
} detail: {
    if let item = selectedItem {
        ItemDetail(item: item)
    } else {
        ContentUnavailableView("Select an item", systemImage: "doc")
    }
}
.navigationSplitViewColumnWidth(min: 200, ideal: 250, max: 300)
```

## Window Management

### Multiple window types

```swift
@main
struct MyApp: App {
    var body: some Scene {
        // Main window
        WindowGroup {
            ContentView()
        }

        // Secondary window type (opened via openWindow)
        WindowGroup("Inspector", id: "inspector", for: Item.ID.self) { $itemId in
            if let itemId {
                InspectorView(itemId: itemId)
            }
        }
        .defaultSize(width: 400, height: 600)

        // Single instance window
        Window("Activity Log", id: "activity") {
            ActivityLogView()
        }
        .keyboardShortcut("L", modifiers: [.command, .shift])
    }
}
```

### Opening windows

```swift
struct ContentView: View {
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        Button("Open Inspector") {
            openWindow(id: "inspector", value: selectedItem.id)
        }
    }
}
```

### Window sizing and position

```swift
WindowGroup {
    ContentView()
}
.defaultSize(width: 900, height: 600)
.defaultPosition(.center)
.windowResizability(.contentSize)     // size to content
.windowResizability(.contentMinSize)  // content sets minimum
```

### Window style

```swift
WindowGroup {
    ContentView()
}
.windowStyle(.hiddenTitleBar)  // chromeless
.windowStyle(.titleBar)       // standard (default)
```

## MenuBarExtra

For menu bar items — either a simple menu or a full window:

### Simple menu

```swift
@main
struct MyApp: App {
    var body: some Scene {
        MenuBarExtra("Status", systemImage: "circle.fill") {
            Button("Show Dashboard") { ... }
            Button("Refresh") { ... }
            Divider()
            Button("Quit") { NSApplication.shared.terminate(nil) }
        }
    }
}
```

### Window-style menu bar popover

```swift
MenuBarExtra("Status", systemImage: "circle.fill") {
    MenuBarContentView()
        .frame(width: 300, height: 400)
}
.menuBarExtraStyle(.window)
```

### MenuBarExtra alongside main window

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }

        MenuBarExtra("Quick Access", systemImage: "bolt.fill") {
            QuickAccessView()
        }
        .menuBarExtraStyle(.window)
    }
}
```

## Settings

### Tab-based settings

```swift
struct SettingsView: View {
    var body: some View {
        TabView {
            Tab("General", systemImage: "gear") {
                GeneralSettingsView()
            }
            Tab("Appearance", systemImage: "paintbrush") {
                AppearanceSettingsView()
            }
            Tab("Accounts", systemImage: "person.crop.circle") {
                AccountsSettingsView()
            }
            Tab("Advanced", systemImage: "gearshape.2") {
                AdvancedSettingsView()
            }
        }
        .frame(width: 450)
        .fixedSize()
    }
}
```

### Settings tab content

Use `Form` for consistent layout:

```swift
struct GeneralSettingsView: View {
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("checkForUpdates") private var checkForUpdates = true

    var body: some View {
        Form {
            Toggle("Launch at login", isOn: $launchAtLogin)
            Toggle("Check for updates automatically", isOn: $checkForUpdates)
        }
        .formStyle(.grouped)
        .padding()
    }
}
```

### Registering Settings scene

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }

        Settings {
            SettingsView()
        }
    }
}
```

The system automatically adds "Settings..." to the app menu with ⌘, shortcut.

## Toolbars

Toolbars get liquid glass automatically in macOS 26. Do not override their background.

```swift
struct ContentView: View {
    @State private var searchText = ""

    var body: some View {
        MainContent()
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add", systemImage: "plus") { addItem() }
                }

                ToolbarItem(placement: .secondaryAction) {
                    Button("Filter", systemImage: "line.3.horizontal.decrease") { toggleFilter() }
                }
            }
            .searchable(text: $searchText, placement: .toolbar)
    }
}
```

### Toolbar placements on macOS

| Placement | Where it appears |
|---|---|
| `.automatic` | System decides |
| `.primaryAction` | Leading area (most prominent) |
| `.secondaryAction` | After primary actions |
| `.confirmationAction` | Trailing edge (sheets/popovers) |
| `.cancellationAction` | Leading edge (sheets/popovers) |
| `.navigation` | Near the navigation controls |
| `.status` | Center of toolbar |

### Customizable toolbar

```swift
.toolbar(id: "main") {
    ToolbarItem(id: "add", placement: .primaryAction) {
        Button("Add", systemImage: "plus") { }
    }
    ToolbarItem(id: "share", placement: .secondaryAction) {
        ShareLink(item: url)
    }
}
.toolbarRole(.editor)
```

## Commands

### Menu bar commands

```swift
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Project") { createProject() }
                    .keyboardShortcut("n", modifiers: .command)
            }

            CommandMenu("View") {
                Button("Toggle Sidebar") { toggleSidebar() }
                    .keyboardShortcut("s", modifiers: [.command, .control])
            }
        }
    }
}
```

### Keyboard shortcuts on views

```swift
Button("Save") { save() }
    .keyboardShortcut("s", modifiers: .command)

Button("Delete") { delete() }
    .keyboardShortcut(.delete, modifiers: .command)
```

### Focus-based keyboard handling

For keyboard shortcuts that depend on which view has focus:

```swift
struct EditorView: View {
    @FocusState private var isFocused: Bool

    var body: some View {
        TextEditor(text: $content)
            .focused($isFocused)
            .onKeyPress(.escape) {
                isFocused = false
                return .handled
            }
    }
}
```

## AppKit Interop

### NSViewRepresentable

For AppKit views with no SwiftUI equivalent:

```swift
struct WebView: NSViewRepresentable {
    let url: URL

    func makeNSView(context: Context) -> WKWebView {
        WKWebView()
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {
        nsView.load(URLRequest(url: url))
    }
}
```

### With Coordinator for delegation

```swift
struct ColorWellView: NSViewRepresentable {
    @Binding var color: Color

    func makeNSView(context: Context) -> NSColorWell {
        let well = NSColorWell()
        well.target = context.coordinator
        well.action = #selector(Coordinator.colorChanged(_:))
        return well
    }

    func updateNSView(_ nsView: NSColorWell, context: Context) {
        nsView.color = NSColor(color)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(color: $color)
    }

    class Coordinator: NSObject {
        var color: Binding<Color>

        init(color: Binding<Color>) {
            self.color = color
        }

        @objc func colorChanged(_ sender: NSColorWell) {
            color.wrappedValue = Color(nsColor: sender.color)
        }
    }
}
```

### When to bridge

Only bridge to AppKit when SwiftUI genuinely cannot do it:

- WebKit views (`WKWebView`)
- Low-level text editing (`NSTextView` with custom layout)
- System panels not exposed in SwiftUI (e.g., custom `NSPanel` floating windows)
- Hardware interaction that requires AppKit APIs

Check first — SwiftUI adds new native views each release. If SwiftUI can do it, don't bridge.

## Sandboxing, File Access, and Drag & Drop

See `references/sandboxing.md` for entitlements, `DocumentGroup`, `FileDocument`, file pickers with security-scoped URLs, and `Transferable` drag and drop.

## Key references

| File | What it covers |
|---|---|
| `references/sandboxing.md` | Entitlements, file access (DocumentGroup, file pickers), drag and drop (Transferable) |
