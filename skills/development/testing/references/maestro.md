# Maestro E2E Tests

Maestro tests React Native / Expo apps using YAML-based flows. Each flow is a script that taps, types, scrolls, and asserts against a running app.

## Project structure

```
.maestro/
├── flows/
│   ├── auth/
│   │   └── sign-in.yaml
│   ├── onboarding/
│   │   └── complete-onboarding.yaml
│   └── dashboard/
│       ├── view-items.yaml
│       └── create-item.yaml
└── helpers/
    └── _sign-in.yaml   # shared setup, prefixed with _ by convention
```

One flow file per user journey. Helpers (prefixed `_`) are not run directly — they are composed via `runFlow`.

## Flow anatomy

```yaml
appId: com.example.myapp
---
- launchApp:
    clearState: true        # reset app storage before this flow

- assertVisible: "Welcome"  # verify starting state

- tapOn: "Sign In"          # tap by visible text label

- tapOn:
    id: "email-input"       # tap by accessibility ID (testID in React Native)

- inputText: "user@example.com"   # types into the currently focused field

- tapOn:
    id: "password-input"
- inputText: "password"

- tapOn:
    text: "Submit"

- assertVisible: "Dashboard"      # verify navigation succeeded
```

Key commands:

| Command | What it does |
|---|---|
| `launchApp` | Start the app (optionally `clearState: true` to wipe storage) |
| `tapOn` | Tap element by text, `id:`, or `label:` |
| `inputText` | Type into the currently focused field |
| `assertVisible` | Assert an element is visible (text or `id:`) |
| `assertNotVisible` | Assert an element is absent |
| `scrollUntilVisible` | Scroll until an element comes into view |
| `runFlow` | Compose another flow file as a step |
| `waitForAnimationToEnd` | Pause until animations settle |
| `takeScreenshot` | Save a screenshot (useful for debugging) |
| `back` | Navigate back (Android hardware back) |

## Composing flows with helpers

Use `runFlow` to avoid repeating setup steps:

```yaml
# flows/dashboard/view-items.yaml
appId: com.example.myapp
---
- runFlow: ../../helpers/_sign-in.yaml

- assertVisible: "My Items"
- assertVisible: "Add item"
```

```yaml
# helpers/_sign-in.yaml
---
- launchApp:
    clearState: true
- tapOn: "Sign In"
- tapOn:
    id: "email-input"
- inputText: ${EMAIL:-test@example.com}
- tapOn:
    id: "password-input"
- inputText: ${PASSWORD:-testpassword}
- tapOn: "Submit"
- assertVisible: "Dashboard"
```

## Environment variables

Pass runtime values via an `env` block or a `.env` file in `.maestro/`:

```yaml
appId: com.example.myapp
env:
  EMAIL: ${EMAIL:-test@example.com}
  PASSWORD: ${PASSWORD:-testpassword}
---
- tapOn:
    id: "email-input"
- inputText: ${EMAIL}
```

Run with a custom env: `maestro test --env EMAIL=other@example.com flows/auth/sign-in.yaml`

## Selectors

Prefer text labels when the UI is stable. Use `id:` (maps to React Native `testID`) when labels are dynamic or translatable.

```yaml
# By visible text (fragile if text changes or is localized)
- tapOn: "Create account"

# By testID (stable, preferred for interactive elements)
- tapOn:
    id: "create-account-btn"

# By accessibility label
- tapOn:
    label: "Close dialog"
```

In React Native, set `testID` on elements that Maestro needs to target:

```tsx
<Pressable testID="create-account-btn" onPress={handlePress}>
  <Text>Create account</Text>
</Pressable>
```

## Scrolling

```yaml
- scrollUntilVisible:
    text: "Load more"
    direction: DOWN      # UP | DOWN | LEFT | RIGHT

- scrollUntilVisible:
    id: "end-of-list"
    timeout: 5000        # ms, default 20000
```

## Running Maestro locally

```bash
# Run a single flow
maestro test .maestro/flows/dashboard/view-items.yaml

# Run all flows in a directory
maestro test .maestro/flows/

# Run with a custom env var
maestro test --env EMAIL=test@example.com .maestro/flows/auth/sign-in.yaml

# Interactive studio (record flows visually)
maestro studio
```

The app must already be running on a simulator/emulator or physical device. For Expo:

```bash
# Terminal 1 — start the app
npx expo start

# Terminal 2 — run flows
maestro test .maestro/flows/
```

## CI integration

```yaml
# .github/workflows/e2e.yml
- name: Run Maestro E2E tests
  uses: mobile-dev-inc/action-maestro-cloud@v1
  with:
    api-key: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
    app-file: app-release.apk          # or .ipa for iOS
    workspace: .maestro
```

For local CI runners (without Maestro Cloud):

```bash
maestro test .maestro/flows/ --format junit --output test-results.xml
```

## Rules

- One flow per user journey — don't chain unrelated features in one file
- Use `testID` props in React Native for interactive elements; avoid coordinate-based taps
- Assert visible state after every significant navigation or action
- Use `clearState: true` in `launchApp` when the flow requires a fresh app state
- Keep helpers stateless — they should work regardless of what ran before
- Don't assert on loading spinners — use `assertVisible` on the final state instead
