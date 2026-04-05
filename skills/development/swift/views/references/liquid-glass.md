# Liquid Glass Design Language

Liquid glass is the design language introduced in macOS 26 / iOS 26 at WWDC 2025. Apps that don't adopt it look dated. This reference covers the APIs and principles.

## Core Principles

- **Depth through translucency** — UI layers are transparent glass that reveals content behind them, creating a sense of physical depth
- **Light and environment** — glass surfaces react to ambient light and content beneath them
- **Fluid motion** — transitions between states are smooth, physics-based animations
- **Minimal chrome** — reduce visual weight of controls; let content breathe
- **Semantic materials** — use system-provided materials rather than hard-coded colors so the system adapts to context

## Glass Effect API

### Basic glass effect

Apply `.glassEffect()` to give a view a translucent glass background:

```swift
Text("Hello")
    .padding()
    .glassEffect()
```

### Glass effect in a container

Use `GlassEffectContainer` to group multiple glass elements that share the same glass plane — they merge visually instead of stacking:

```swift
GlassEffectContainer {
    HStack {
        Button("Left") { }
            .glassEffect()
        Button("Right") { }
            .glassEffect()
    }
}
```

### Glass effect shapes

Control the shape of the glass region:

```swift
Text("Rounded")
    .padding()
    .glassEffect(.regular.shape(.capsule))

Text("Custom")
    .padding()
    .glassEffect(.regular.shape(.rect(cornerRadius: 12)))
```

### Interactive glass

For buttons and controls, glass responds to press states automatically when applied to `Button` or other interactive views.

## Materials

Use SwiftUI's built-in materials — they automatically adopt the liquid glass aesthetic on macOS 26:

```swift
.background(.ultraThinMaterial)
.background(.thinMaterial)
.background(.regularMaterial)
.background(.thickMaterial)
.background(.ultraThickMaterial)
```

**Do not** use opaque background colors where glass should appear. System materials adapt to light/dark mode and the content behind them.

## Toolbars and Navigation

Toolbars automatically get glass treatment in macOS 26. Do not override toolbar backgrounds with opaque colors:

```swift
// GOOD — system applies glass automatically
.toolbar {
    ToolbarItem(placement: .automatic) {
        Button("Add", systemImage: "plus") { }
    }
}

// BAD — kills the glass effect
.toolbarBackground(.visible, for: .windowToolbar)
.toolbarBackground(Color.white, for: .windowToolbar)
```

`NavigationSplitView` sidebars and `TabView` tabs are automatically translucent glass.

## Buttons and Controls

Use system button styles — they adopt glass automatically:

```swift
// System styles that get glass treatment
Button("Action") { }
    .buttonStyle(.borderedProminent)

Button("Secondary") { }
    .buttonStyle(.bordered)
```

For custom button styles, apply `.glassEffect()` rather than adding your own background:

```swift
struct GlassButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .glassEffect()
            .opacity(configuration.isPressed ? 0.8 : 1.0)
    }
}
```

## Icons and SF Symbols

Use SF Symbols with automatic rendering mode — the system tints them appropriately for glass surfaces:

```swift
Image(systemName: "gear")
    .symbolRenderingMode(.automatic)
```

Avoid setting explicit foreground colors on icons sitting on glass — use `.primary` or `.secondary` to let the system handle contrast.

## Colors on Glass

- Use semantic colors (`.primary`, `.secondary`, `.accentColor`) not hard-coded hex values
- For custom colors, define them as asset catalog colors with light/dark variants
- Text on glass should use `.primary` or `.secondary` for automatic legibility
- Avoid pure `.white` or `.black` — they don't adapt to the glass surface

## Anti-patterns

| Don't | Do instead |
|---|---|
| Opaque backgrounds behind toolbars/sidebars | Let the system apply glass automatically |
| Hard-coded colors on glass surfaces | Use semantic colors (`.primary`, `.secondary`) |
| Custom blur effects to fake glass | Use `.glassEffect()` or system materials |
| Stacking multiple `.background(.ultraThinMaterial)` | Use `GlassEffectContainer` to merge glass layers |
| Disabling vibrancy/translucency | Embrace the glass — it's the platform language now |
| Heavy drop shadows on glass elements | Glass has built-in depth; shadows compete with it |
| `.ultraThinMaterial` + `Color.white.opacity()` overlay | Remove the overlay — the material alone provides the right translucency |
| `.fill.quaternary` on cards in a glass context | Use `.glassEffect(.regular.shape(.rect(cornerRadius:)))` |
| `.background(.ultraThinMaterial)` on the root NavigationSplitView | Use `.background(.clear)` — the window itself provides glass |

### Common migration mistake: material + color overlay

A frequent pre-glass pattern is stacking a material with an explicit color overlay for light/dark mode:

```swift
// BAD — the white overlay kills translucency and creates an opaque white bar
.background {
    ZStack {
        Rectangle().fill(.ultraThinMaterial)
        Rectangle().fill(colorScheme == .dark ? Color.black.opacity(0.5) : Color.white.opacity(0.3))
    }
    .ignoresSafeArea()
}
```

Fix: remove the entire background block. The window chrome and system provide glass automatically. If you need a subtle background, use a single material without overlays:

```swift
// GOOD — just let the system handle it
// (often no background modifier needed at all)
```

### Card backgrounds in glass contexts

Cards using `.fill.quaternary` render as opaque flat surfaces that don't participate in the glass aesthetic. Replace with `.glassEffect()`:

```swift
// BAD — opaque, flat, doesn't blur through
.background(.fill.quaternary, in: RoundedRectangle(cornerRadius: 10))

// GOOD — glass card that blurs the content behind it
.glassEffect(.regular.shape(.rect(cornerRadius: 10)))
```

## Backward Compatibility

If supporting macOS 15 alongside macOS 26, use `#available`:

```swift
if #available(macOS 26, *) {
    content.glassEffect()
} else {
    content.background(.regularMaterial)
}
```

For new apps targeting macOS 26 only, use glass everywhere and don't worry about fallback.
