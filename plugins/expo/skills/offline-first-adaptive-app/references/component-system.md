# Component System
Use this when the user asks how to structure reusable UI in an Expo app.

## Component Layers
```txt
shared/ui
  generic primitives
  no feature imports
  no persistence
  no API calls

shared/layout
  layout primitives and adaptive containers
  no domain-specific behavior

features/*/components
  domain-aware reusable pieces
  may use feature types and shared UI

features/*/screens
  composition, data hooks, navigation wiring
```

## Good Reusable Primitive
```tsx
<Button
  variant="primary"
  size="md"
  loading={isSaving}
  disabled={!canSubmit}
  onPress={submit}
>
  Save
</Button>
```

## Bad Shared Primitive
```tsx
<SaveTaskButton taskId={taskId} />
```

That is not a shared primitive; it is a task feature component.

## Review Checklist
Ask:

```txt
Can this component be used in another feature without importing domain types?
Does it know about navigation?
Does it fetch data?
Does it write to storage?
Is styling driven by tokens rather than ad-hoc constants?
Does it support loading, disabled, error, and accessibility states where relevant?
```

If a shared component knows too much about the product, move it into the feature.
