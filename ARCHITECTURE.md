# Architecture Overview

## High-Level Architecture

react-permissions-gate is built with a clean, layered architecture:

```
┌─────────────────────────────────────────┐
│         React Components Layer          │
│  PermissionsGate, ProtectedRoute, etc.  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Context & Provider Layer        │
│      PermissionsProvider, Hooks         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Core Rule Engine Layer         │
│   Permission evaluation, rule resolution │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Dev Tools Layer (Dev)          │
│    DevPanel, DevStore, Evaluation Track │
└─────────────────────────────────────────┘
```

## Core Modules

### 1. Core (`src/core/`)

**types.ts**
- Defines all TypeScript interfaces and types
- `PermissionContext`: Context passed to rules
- `PermissionRule`: Function signature for rules
- `PermissionEvaluation`: Tracking data structure
- All exported types for consumer use

**ruleEngine.ts**
- Core permission evaluation logic
- `evaluateRule()`: Executes a single rule with timing
- `resolveStringRule()`: Maps string keys to rule functions
- `evaluatePermission()`: Main evaluation orchestrator
- `createPermissionContext()`: Context factory
- Handles sync/async rules transparently

### 2. React Components (`src/react/`)

**PermissionsProvider.tsx**
- React Context provider
- Exposes `usePermissionsContext` hook
- Manages user, roles, permissions, rules, flags
- Provides `evaluatePermission` function to children
- Integrates with dev tools when enabled

**PermissionsGate.tsx**
- Declarative permission boundary component
- Props: `allow`, `any`, `all`, `resource`, `mode`, `fallback`
- Supports hide/disable modes
- Handles async rules with loading states
- Uses `usePermission` hook internally

**usePermission.ts**
- Custom hook for permission checks
- Returns `{ allowed, loading }` state
- Re-evaluates when dependencies change
- `usePermissionValue`: Simpler variant returning just boolean

**Permissioned.tsx**
- Render-prop component
- Passes `(allowed, loading)` to children function
- Maximum flexibility for custom rendering

**ProtectedRoute.tsx**
- Route protection wrapper
- Framework-agnostic design
- Supports `onAccessDenied` callback
- Default fallback for denied access

### 3. Dev Tools (`src/devtools/`)

**DevStore.ts**
- Observable state store for dev panel
- Tracks all permission evaluations
- Manages override state (roles, permissions, flags)
- Simple pub/sub pattern with `subscribe()`
- Singleton instance exported as `devStore`

**useDevRegister.ts**
- Hook to register evaluations with dev store
- `useDevToolsState`: Subscribe to dev store updates
- Bridges React components and dev store

**DevPanel.tsx**
- Floating dev panel UI component
- Three tabs: Evaluations, Overrides, Context
- Real-time permission tracking display
- Interactive role/permission/flag toggles
- Automatic in development, hidden in production

**PermissionsRoot.tsx**
- Convenience wrapper around PermissionsProvider
- Auto-integrates DevPanel
- Recommended entry point for consumers

## Data Flow

### Permission Check Flow

```
1. Component renders with <PermissionsGate allow="user.edit" resource={user}>
                    ↓
2. usePermission hook triggered
                    ↓
3. Calls context.evaluatePermission(check, resource)
                    ↓
4. evaluatePermission in ruleEngine.ts
   - Resolves check to rule function(s)
   - Creates permission context
   - Executes rule(s) with timing
                    ↓
5. Rule function runs: ({ user, resource, roles, permissions, flags }) => boolean
                    ↓
6. Result + metadata returned
                    ↓
7. If dev tools enabled: registerEvaluation() called
                    ↓
8. Component renders based on result (hide/disable/show)
```

### Dev Tools Flow

```
1. Permission evaluated
          ↓
2. PermissionsProvider calls onEvaluationRegister
          ↓
3. DevStore.addEvaluation() stores evaluation
          ↓
4. DevStore.notify() triggers all listeners
          ↓
5. DevPanel re-renders with new evaluation
          ↓
6. User sees evaluation in real-time
```

### Override Flow

```
1. User toggles role in DevPanel
          ↓
2. DevStore.toggleRole() updates state
          ↓
3. DevStore.notify() triggers listeners
          ↓
4. PermissionsRoot reads override state
          ↓
5. Passes overridden values to PermissionsProvider
          ↓
6. All permission checks use overridden context
          ↓
7. UI updates based on new permissions
```

## Design Decisions

### Why Context + Hooks?

- **Context**: Centralized permission state accessible anywhere
- **Hooks**: Modern React patterns, easy to use
- **No Redux**: Keeps bundle size small, one less dependency

### Why Observable Pattern for DevStore?

- Lightweight pub/sub without external library
- Simple to implement and understand
- Minimal overhead in production (tree-shaken)

### Why Async Support?

- Real-world permissions often require API calls
- Checking subscription status, quota limits, etc.
- Promise-based API is simple and familiar

### Why Two Provider Options?

- `PermissionsProvider`: Bare provider for custom integrations
- `PermissionsRoot`: Convenient wrapper with dev tools
- Flexibility for advanced users, simplicity for beginners

### Why Inline Functions Allowed?

- Quick prototyping without defining rules
- Edge cases where dynamic logic is needed
- Still discouraged in favor of named rules (testability)

## Performance Considerations

### Memoization
- Context value memoized with `useMemo`
- Prevents unnecessary re-renders
- Dependencies properly tracked

### Evaluation Caching
- Currently no caching (each check re-evaluates)
- Future: Add optional caching layer with TTL
- Trade-off: Freshness vs performance

### Dev Tools Impact
- Zero impact in production (tree-shaken)
- Minimal impact in development
- Evaluations capped at 100 recent entries

### Bundle Size
- Core: ~5KB gzipped
- Tree-shakeable: Pay for what you use
- No heavy dependencies (only React)

## Extension Points

### Custom Providers
Wrap `PermissionsProvider` with your own logic:
```tsx
function MyProvider({ children }) {
  const user = useAuth();
  const roles = useUserRoles(user);
  
  return (
    <PermissionsProvider user={user} roles={roles}>
      {children}
    </PermissionsProvider>
  );
}
```

### Custom Dev Tools
Build your own dev tools using the core hooks:
```tsx
import { useDevToolsState } from 'react-permissions-gate';

function MyCustomDevPanel() {
  const state = useDevToolsState();
  // Build your UI
}
```

### Direct Engine Access
Use the rule engine directly without React:
```tsx
import { evaluatePermission, createPermissionContext } from 'react-permissions-gate';

const ctx = createPermissionContext(user, resource, roles, permissions, flags);
const result = await evaluatePermission(check, ctx, rules);
```

## Testing Strategy

### Unit Tests
- Test permission rules as pure functions
- Mock context values
- Assert on rule results

### Integration Tests
- Render components with PermissionsProvider
- Test gate behavior (hide/disable)
- Test hook return values

### E2E Tests
- Test complete permission flows
- Verify UI visibility based on permissions
- Test route protection

## Future Enhancements

### Potential Features
- Permission caching with TTL
- Batch evaluation for multiple checks
- Permission audit logging
- SSR/SSG hydration support
- React Native compatibility
- Performance monitoring
- Rule composition helpers
- Permission inheritance
- Wildcard permissions

### Performance Optimizations
- Evaluation result caching
- Debounced re-evaluations
- Lazy rule loading
- Web Worker evaluation for expensive checks

## Security Considerations

### Client-Side Only
- This is UI-level authorization
- **Never** rely solely on client checks
- Always validate on the server
- Think of this as UX optimization

### XSS Protection
- No `dangerouslySetInnerHTML` used
- User input sanitized
- React's built-in XSS protection

### Sensitive Data
- Don't expose sensitive rules to client
- Keep secret logic on server
- Use this for UI flow control only

## Compatibility

### React Versions
- Requires React 16.8+ (hooks)
- Compatible with React 17, 18, 19
- Works with React DOM and React Native (mostly)

### Build Tools
- Works with Create React App
- Works with Next.js (use `"use client"`)
- Works with Vite
- Works with Webpack, Rollup, esbuild

### TypeScript
- Full TypeScript support
- Minimum TypeScript 4.5+
- Generic types for user/resource

### Browsers
- Modern browsers (ES2020 target)
- No IE11 support
- Use polyfills if needed for older browsers

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT - See [LICENSE](./LICENSE) file.
