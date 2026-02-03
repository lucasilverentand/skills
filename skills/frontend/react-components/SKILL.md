---
name: react-components
description: Creates React components following best practices. Use when building reusable components, implementing patterns, or structuring component logic.
argument-hint: [component-name]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# React Components

Creates React components following best practices.

## Your Task

1. **Identify requirements**: Understand component needs
2. **Design API**: Plan props and interfaces
3. **Implement**: Build the component
4. **Add types**: Ensure type safety
5. **Test**: Verify functionality

## Functional Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        variants[variant],
        sizes[size],
        { 'opacity-50 cursor-not-allowed': disabled || loading }
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

## Compound Component

```tsx
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ children, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ value, children }: TabProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  return (
    <button
      className={cn('tab', { active: activeTab === value })}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ value, children }: PanelProps) {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== value) return null;
  return <div className="tab-panel">{children}</div>;
};
```

## Custom Hook

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Tips

- Keep components small and focused
- Extract logic to custom hooks
- Use composition over configuration
- Prefer controlled components
