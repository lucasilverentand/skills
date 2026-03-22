---
name: accessibility
description: Audits and fixes accessibility issues across web (WCAG/ARIA), React Native (iOS VoiceOver / Android TalkBack), and SwiftUI (VoiceOver). Use when implementing UI components, reviewing a feature for accessibility, fixing screen reader issues, verifying keyboard navigation, adding React Native accessibility props, or auditing SwiftUI views with Accessibility Inspector.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Accessibility

## Decision Tree

- What platform?
  - **Web (React, HTML)** → what task?
    - **Audit a component or page for WCAG violations** → run `tools/wcag-audit.ts <path>`, then see "Fixing Web Violations" below
    - **Check color contrast** → run `tools/contrast-check.ts <stylesheet>`, then see "Contrast Fixes" below
    - **Fix ARIA attribute issues** → run `tools/aria-lint.ts <path>`, then see "ARIA Fixes" below
    - **Verify keyboard navigation and focus order** → run `tools/focus-order.ts <component>`, then see "Focus Management" below
    - **Generate a full accessibility report** → run all four tools, compile results
  - **React Native / Expo** → see "React Native Accessibility" below
  - **SwiftUI / iOS** → see "SwiftUI Accessibility" below

## Fixing Web Violations

After running `tools/wcag-audit.ts`, violations are ranked by severity (critical → serious → moderate → minor). Address critical and serious first.

Common critical violations and fixes:

| Violation | Fix |
|---|---|
| Images without alt text | Add `alt="description"` to meaningful images; `alt=""` for decorative ones |
| Form inputs without labels | Add `<label htmlFor="id">` or `aria-label` / `aria-labelledby` |
| Buttons with no accessible name | Add text content or `aria-label`; never use `<div onClick>` for interactive elements |
| Links that open in a new tab without warning | Add `aria-label="... (opens in new tab)"` or a visible indicator |
| Missing document language | Add `lang="en"` (or correct locale) to `<html>` |
| Insufficient heading structure | Ensure one `<h1>` per page, no skipped heading levels |

Rules:
- Use semantic HTML elements first (`<button>`, `<nav>`, `<main>`, `<article>`) — ARIA is a fallback
- Never remove focus outlines without providing a visible alternative
- Test with an actual screen reader (VoiceOver on macOS, NVDA on Windows) for critical paths

## Contrast Fixes

`tools/contrast-check.ts` reports color pairs with their contrast ratio and required minimum.

WCAG 2.1 requirements:
- Normal text (< 18pt): ratio ≥ 4.5:1 (AA), ≥ 7:1 (AAA)
- Large text (≥ 18pt or 14pt bold): ratio ≥ 3:1 (AA)
- UI components and graphics: ratio ≥ 3:1 (AA)

Fix approach:
1. Identify which color to adjust — usually darken foreground or lighten background
2. Use the browser DevTools color picker or a contrast checker to find a compliant value
3. Update the design token or Tailwind config — do not hardcode one-off colors
4. For Tailwind: prefer darker shade variants (`text-gray-700` over `text-gray-400` on white)

## ARIA Fixes

After running `tools/aria-lint.ts`, common issues:

| Issue | Fix |
|---|---|
| `role` on an element that already has that implicit role | Remove redundant `role` (e.g., `role="button"` on `<button>`) |
| `aria-label` on a non-interactive element | Remove; use visible text instead |
| `aria-hidden="true"` on a focusable element | Make it non-focusable or remove `aria-hidden` |
| `aria-expanded` without a controlled element | Add `aria-controls="panel-id"` pointing to the toggled element |
| Missing `aria-live` on dynamic content | Add `aria-live="polite"` for updates, `"assertive"` only for urgent alerts |
| `tabindex > 0` | Replace with `tabindex="0"` and fix DOM order to control tab sequence |

## Focus Management

After running `tools/focus-order.ts`:

1. **Unreachable elements** — elements that should be focusable but aren't:
   - Add `tabindex="0"` for non-interactive elements that need focus
   - Ensure the element has a visible focus indicator

2. **Wrong tab order** — tab order doesn't match visual order:
   - Fix DOM order to match visual layout instead of using `tabindex > 0`
   - Use CSS `order` property only when it doesn't break reading order

3. **Modal focus trapping** — focus must stay inside an open modal:
   - Trap focus with a focus trap library or manual `keydown` handler on `Tab`/`Shift+Tab`
   - Return focus to the trigger element when the modal closes

4. **Skip navigation** — long pages need a "Skip to main content" link:
   - Add as the first focusable element in `<body>`
   - Make it visible on focus, hidden otherwise (`sr-only` with `:focus` override)

## React Native Accessibility

React Native maps accessibility props to native iOS (VoiceOver) and Android (TalkBack) APIs.

### Core props

```tsx
<Pressable
  accessible={true}
  accessibilityLabel="Delete item"
  accessibilityHint="Removes the item from your list"
  accessibilityRole="button"
  accessibilityState={{ disabled: isLoading }}
  onPress={handleDelete}
>
  <TrashIcon />
</Pressable>
```

| Prop | Purpose |
|---|---|
| `accessible` | Makes the element a single focusable unit for screen readers |
| `accessibilityLabel` | What the screen reader announces — required for icon-only interactive elements |
| `accessibilityHint` | Describes what happens when activated — use for non-obvious actions |
| `accessibilityRole` | Semantic role: `button`, `link`, `image`, `header`, `checkbox`, `radiobutton`, `tab`, `none` |
| `accessibilityState` | Current state: `{ disabled, selected, checked, busy, expanded }` |
| `accessibilityValue` | For sliders/progress: `{ min, max, now, text }` |

### Hiding decorative elements

```tsx
// Hide purely decorative content from screen readers
<Image source={decorativeBanner} accessibilityElementsHidden={true} />

// Android equivalent
<View importantForAccessibility="no-hide-descendants">
  <DecorativeContent />
</View>
```

### Grouping elements

Combine a label and a value into one focusable unit so the screen reader reads them together:

```tsx
<View accessible={true} accessibilityLabel={`${item.name}, ${item.price}`}>
  <Text>{item.name}</Text>
  <Text>{item.price}</Text>
</View>
```

### Live regions (dynamic updates)

Announce dynamic content changes without focus:

```tsx
<Text accessibilityLiveRegion="polite">
  {errorMessage}
</Text>
```

- `"polite"` — waits for the current speech to finish (for non-urgent updates)
- `"assertive"` — interrupts current speech (for critical errors only)

### Focus management

Move focus programmatically when a screen or state changes:

```tsx
import { AccessibilityInfo, findNodeHandle, useRef } from "react-native"

const headingRef = useRef(null)

useEffect(() => {
  const tag = findNodeHandle(headingRef.current)
  if (tag) AccessibilityInfo.setAccessibilityFocus(tag)
}, [screenVisible])

<Text ref={headingRef} accessibilityRole="header">New Screen Title</Text>
```

### Checking screen reader state

```tsx
import { AccessibilityInfo } from "react-native"

useEffect(() => {
  AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
    if (enabled) {
      // Adjust UI for screen reader (e.g., simplify animations)
    }
  })
}, [])
```

### Common mistakes

| Mistake | Fix |
|---|---|
| Icon-only `<Pressable>` with no label | Add `accessibilityLabel` describing the action |
| Nested touchable wrappers | Make only the outermost element `accessible` — inner elements will be ignored |
| Animated elements that distract VoiceOver | Respect `AccessibilityInfo.isReduceMotionEnabled()` |
| `FlatList` with no item labels | Set `accessibilityLabel` on each item's root view |
| Modal without focus trap | Use `accessibilityViewIsModal={true}` on the modal container |

### Testing

- **iOS VoiceOver**: Settings → Accessibility → VoiceOver, or triple-click side button. Swipe to navigate, double-tap to activate.
- **Android TalkBack**: Settings → Accessibility → TalkBack. Swipe to navigate, double-tap to activate.
- **Expo Go**: test on a real device — simulators support VoiceOver but not TalkBack.

---

## SwiftUI Accessibility

SwiftUI exposes VoiceOver and Switch Control via view modifiers. Most standard components (Button, Toggle, Slider, TextField) are accessible by default — focus on custom components and complex layouts.

### Core modifiers

```swift
Button(action: deleteItem) {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete item")
.accessibilityHint("Removes the item from your list")
.accessibilityAddTraits(.isDestructiveAction)
```

| Modifier | Purpose |
|---|---|
| `.accessibilityLabel(_:)` | What VoiceOver reads — required for icon-only controls |
| `.accessibilityHint(_:)` | Describes the action result; optional but useful for non-obvious interactions |
| `.accessibilityValue(_:)` | Current value for controls (e.g., "50%" for a custom slider) |
| `.accessibilityAddTraits(_:)` | Semantic traits: `.isButton`, `.isHeader`, `.isSelected`, `.isDestructiveAction` |
| `.accessibilityRemoveTraits(_:)` | Remove traits inherited from the base element |
| `.accessibilityHidden(_:)` | Hide decorative elements from VoiceOver |

### Grouping elements

Combine child views into a single focusable unit:

```swift
VStack(alignment: .leading) {
    Text(item.name)
    Text(item.subtitle)
        .foregroundStyle(.secondary)
}
.accessibilityElement(children: .combine)
// VoiceOver reads: "<name>, <subtitle>"
```

Use `.ignore` to let VoiceOver see individual children, `.contain` to make a container accessible without merging child labels.

### Custom controls

```swift
struct RatingControl: View {
    @Binding var rating: Int
    let max = 5

    var body: some View {
        HStack {
            ForEach(1...max, id: \.self) { star in
                Image(systemName: star <= rating ? "star.fill" : "star")
                    .onTapGesture { rating = star }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Rating")
        .accessibilityValue("\(rating) out of \(max) stars")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment: if rating < max { rating += 1 }
            case .decrement: if rating > 0 { rating -= 1 }
            @unknown default: break
            }
        }
    }
}
```

### Focus management

```swift
@AccessibilityFocusState private var isFocused: Bool

VStack {
    Text("Error: invalid email")
        .accessibilityFocused($isFocused)

    Button("Submit") {
        if !isValid {
            isFocused = true  // move VoiceOver focus to the error
        }
    }
}
```

### Headings and navigation

Mark section titles as headings so VoiceOver users can jump between sections:

```swift
Text("Account Settings")
    .font(.headline)
    .accessibilityAddTraits(.isHeader)
```

### Testing

- **Accessibility Inspector** (Xcode → Open Developer Tool → Accessibility Inspector): inspect elements, run audits, simulate VoiceOver navigation without enabling it system-wide.
- **VoiceOver on device**: Settings → Accessibility → VoiceOver. Swipe to navigate, double-tap to activate.
- **SwiftUI previews**: Accessibility Inspector works against live previews — use it early in development.

---

## Key references

| File | What it covers |
|---|---|
| `tools/wcag-audit.ts` | Scan components and report WCAG 2.1 violations by severity |
| `tools/contrast-check.ts` | Extract color pairs from stylesheets and flag failing contrast ratios |
| `tools/aria-lint.ts` | Detect missing or incorrect ARIA attributes in JSX/TSX files |
| `tools/focus-order.ts` | Trace tab order through a component tree and flag unreachable elements |
