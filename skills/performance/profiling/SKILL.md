---
name: profiling
description: Profiles application performance. Use when debugging slow code, finding memory leaks, or optimizing runtime performance.
argument-hint: [component]
allowed-tools: [Read, Bash, Glob, Grep]
---

# Performance Profiling

Profiles application performance to find bottlenecks.

## Your Task

1. **Identify issue**: Reproduce the slowness
2. **Profile**: Capture performance data
3. **Analyze**: Find hotspots
4. **Optimize**: Fix bottlenecks
5. **Verify**: Confirm improvement

## Browser Profiling

### Chrome DevTools Performance

1. Open DevTools → Performance tab
2. Click Record
3. Perform the slow action
4. Stop recording
5. Analyze flame chart

### React DevTools Profiler

1. Open React DevTools → Profiler tab
2. Click Record
3. Interact with components
4. Review render times

## Node.js Profiling

```bash
# CPU Profile
node --cpu-prof app.js
# Creates .cpuprofile file - open in Chrome DevTools

# Heap Snapshot
node --heap-prof app.js

# Clinic.js (comprehensive)
npx clinic doctor -- node app.js
```

## Common Issues

### Unnecessary Re-renders (React)

```tsx
// Problem: Object created every render
<Component style={{ color: 'red' }} />

// Solution: Memoize
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />

// Problem: Function created every render
<Button onClick={() => handleClick(id)} />

// Solution: useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Memory Leaks

```typescript
// Problem: Event listener not cleaned up
useEffect(() => {
  window.addEventListener('resize', handler);
  // Missing cleanup!
}, []);

// Solution: Clean up
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// Problem: Interval not cleared
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

### Slow Operations

```typescript
// Problem: Expensive computation every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
}

// Solution: Memoize
const sorted = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

## Tips

- Profile in production mode
- Use Chrome DevTools Performance
- Look for long tasks (>50ms)
- Monitor memory over time
