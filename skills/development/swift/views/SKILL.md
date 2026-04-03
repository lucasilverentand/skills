---
name: views
description: SwiftUI view composition, layout, modifiers, animations, and liquid glass design for iOS and macOS apps. Use when building or modifying views, choosing layout containers, applying the liquid glass design language, creating animations, or building custom view modifiers. Trigger phrases: "build a view", "layout", "glass effect", "animation", "liquid glass", "SwiftUI view".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Views

## Decision Tree

- What view task?
  - **Choosing a layout container** → see "Layout" below
  - **Building a new view** → see "View Composition" below
  - **Applying liquid glass design** → see "Liquid Glass" below and `references/liquid-glass.md`
  - **Creating a reusable modifier** → see "Custom Modifiers" below
  - **Adding animation or transitions** → see "Animations" below
  - **Drawing custom shapes** → see "Shapes and Paths" below
  - **Building a list or grid of items** → see "Collections" below
  - **View looks wrong / doesn't match design** → see "Debugging Views" below

## Conventions

### File organization

One view per file. Group by feature, not by type:

```
Sources/
  Features/
    Sidebar/
      SidebarView.swift
      SidebarRow.swift
    Detail/
      DetailView.swift
      DetailToolbar.swift
    Settings/
      SettingsView.swift
      GeneralSettingsTab.swift
      AppearanceSettingsTab.swift
  Components/
    GlassCard.swift
    LoadingIndicator.swift
  Models/
    ...
```

### Naming

- Views: `{Feature}View`, `{Feature}Row`, `{Feature}Card`
- Modifiers: `.{verb}Style()` or `.{noun}Modified()`
- Keep views small — extract subviews when a body exceeds ~40 lines

### View structure

```swift
struct DetailView: View {
    // 1. Dependencies (injected or environment)
    @Environment(Router.self) private var router
    let item: Item

    // 2. Local state
    @State private var isEditing = false

    // 3. Body
    var body: some View {
        content
            .toolbar { toolbar }
    }

    // 4. Extracted subviews as computed properties
    private var content: some View { ... }

    @ToolbarContentBuilder
    private var toolbar: some ToolbarContent { ... }
}
```

## Layout

### Choosing the right container

| Container | When to use |
|---|---|
| `VStack` | Small number of vertically arranged items (< 20) |
| `HStack` | Horizontal row of items |
| `ZStack` | Layered content (overlays, badges, backgrounds) |
| `Grid` | Aligned rows and columns with fixed structure |
| `LazyVStack` | Long scrollable vertical lists |
| `LazyHStack` | Horizontal scrolling content |
| `LazyVGrid` / `LazyHGrid` | Grid of items with dynamic count |
| `ViewThatFits` | Adaptive layout that picks the first child that fits |
| `Layout` protocol | Custom layout algorithm |

### Spacing and alignment

Use consistent spacing. Define spacing constants rather than magic numbers:

```swift
private enum Metrics {
    static let padding: CGFloat = 16
    static let spacing: CGFloat = 12
    static let cornerRadius: CGFloat = 10
}
```

Use `.frame()` sparingly — prefer letting content determine size. Use `Spacer()` and alignment guides for positioning.

### Adaptive layout

Use `ViewThatFits` for views that should adapt to available space:

```swift
ViewThatFits {
    // First try: horizontal layout
    HStack { labelAndControls }
    // Fallback: vertical layout
    VStack { labelAndControls }
}
```

## View Composition

### Extract, don't nest

Break complex views into focused subviews. Prefer computed properties for private subviews that don't need their own state, separate structs for reusable components:

```swift
// Computed property — simple extraction, shares parent state
private var header: some View {
    HStack {
        Text(item.title).font(.headline)
        Spacer()
        statusBadge
    }
}

// Separate struct — reusable, has its own state or takes parameters
struct StatusBadge: View {
    let status: Status

    var body: some View {
        Text(status.label)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .glassEffect()
    }
}
```

### ViewBuilder for containers

Use `@ViewBuilder` when building container views that accept arbitrary content:

```swift
struct Card<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding()
        .glassEffect()
    }
}
```

## Liquid Glass

macOS 26 introduces the liquid glass design language. All new macOS apps must adopt it — apps without glass look immediately dated.

### Key rules

1. **Use `.glassEffect()`** for custom glass surfaces — do not fake it with blur + opacity
2. **Do not override toolbar/sidebar backgrounds** — the system applies glass automatically
3. **Use semantic colors** (`.primary`, `.secondary`) on glass — not hard-coded hex values
4. **Group glass elements** in `GlassEffectContainer` so they merge instead of stack
5. **Use system materials** (`.ultraThinMaterial`, etc.) when you need a translucent background but not full glass
6. **Let system button styles do their thing** — `.borderedProminent` and `.bordered` get glass automatically

### Applying glass to custom views

```swift
// Simple glass card
VStack {
    Text("Title").font(.headline)
    Text("Subtitle").foregroundStyle(.secondary)
}
.padding()
.glassEffect()

// Grouped glass elements that merge
GlassEffectContainer {
    HStack(spacing: 8) {
        ForEach(tabs) { tab in
            TabButton(tab: tab)
                .glassEffect()
        }
    }
}
```

### What gets glass automatically (don't touch it)

- `NavigationSplitView` sidebar
- `.toolbar` items
- `TabView` tabs
- `.borderedProminent` / `.bordered` buttons
- System alerts, sheets, popovers

See `references/liquid-glass.md` for the complete API reference and anti-patterns.

## Custom Modifiers

Create `ViewModifier` structs for reusable styling:

```swift
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .glassEffect(.regular.shape(.rect(cornerRadius: 12)))
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}
```

Use modifiers for repeated styling patterns. Don't create a modifier for something used once.

## Animations

### Implicit animations

Apply `.animation()` to react to state changes:

```swift
Circle()
    .frame(width: isExpanded ? 100 : 50)
    .animation(.spring(duration: 0.3), value: isExpanded)
```

### Explicit animations

Use `withAnimation` when you control the trigger:

```swift
Button("Toggle") {
    withAnimation(.easeInOut(duration: 0.25)) {
        isExpanded.toggle()
    }
}
```

### Transitions

Apply `.transition()` for views entering/leaving:

```swift
if showDetail {
    DetailView()
        .transition(.move(edge: .trailing).combined(with: .opacity))
}
```

### Phase animations

Use `PhaseAnimator` for multi-step sequences:

```swift
PhaseAnimator([false, true]) { phase in
    Image(systemName: "heart.fill")
        .scaleEffect(phase ? 1.2 : 1.0)
        .foregroundStyle(phase ? .red : .pink)
}
```

### Animation principles

- Use `.spring()` as the default — it feels natural
- Keep durations short (0.2–0.4s) for UI state changes
- Match the platform: macOS animations are subtler than iOS
- Always tie animations to a `value:` — avoid bare `.animation(.default)`

## Collections

### Lists

```swift
List(items) { item in
    ItemRow(item: item)
}
.listStyle(.sidebar) // or .inset, .plain
```

### Grids

```swift
let columns = [GridItem(.adaptive(minimum: 200), spacing: 16)]

ScrollView {
    LazyVGrid(columns: columns, spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
    .padding()
}
```

### Performance

- Use `LazyVStack` / `LazyVGrid` for large collections (> 50 items)
- Give every `ForEach` item a stable `Identifiable` id
- Avoid complex computations in view bodies — move to the model
- Use `EquatableView` or `@Observable` to minimize unnecessary diffing

## Shapes and Paths

### Built-in shapes

```swift
RoundedRectangle(cornerRadius: 12)
    .fill(.tertiary)
    .frame(width: 200, height: 100)
```

### Custom shapes

```swift
struct WaveShape: Shape {
    var amplitude: CGFloat

    var animatableData: CGFloat {
        get { amplitude }
        set { amplitude = newValue }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        // ... build path
        return path
    }
}
```

### Canvas for complex drawing

Use `Canvas` for high-performance, imperative drawing:

```swift
Canvas { context, size in
    context.fill(
        Path(ellipseIn: CGRect(origin: .zero, size: size)),
        with: .color(.blue)
    )
}
```

## Debugging Views

When a view doesn't look right:

1. **Check the glass** — are you overriding toolbar/sidebar backgrounds with opaque colors?
2. **Check `.frame()`** — unnecessary frames cause layout issues. Remove them and let content size naturally
3. **Use `border()` to visualize** — `content.border(.red)` to see actual bounds
4. **Check color scheme** — does it work in both light and dark mode?
5. **Simplify** — comment out modifiers one by one until you find the culprit
6. **Check semantic colors** — hard-coded colors break on glass surfaces

## Key references

| File | What it covers |
|---|---|
| `references/liquid-glass.md` | Complete liquid glass API reference, materials, anti-patterns, backward compatibility |
