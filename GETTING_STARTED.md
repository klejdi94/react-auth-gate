# Getting Started with react-auth-gate

This guide will help you set up and use react-auth-gate in your React application.

## Installation

```bash
npm install react-auth-gate
# or
yarn add react-auth-gate
# or
pnpm add react-auth-gate
```

## Step 1: Define Your Permission Rules

Create a file to centralize your permission logic:

```tsx
// permissions.ts
import { PermissionRulesMap } from 'react-auth-gate';

interface User {
  id: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface Post {
  id: string;
  authorId: string;
}

export const rules: PermissionRulesMap<User, Post> = {
  // Role-based rules
  'admin.access': ({ user }) => user.role === 'admin',
  
  // Resource-based rules
  'user.edit': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource?.id,
  
  'post.edit': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource?.authorId,
  
  'post.delete': ({ user, resource }) =>
    user.role === 'admin' || user.id === resource?.authorId,
};
```

## Step 2: Wrap Your App

Use `PermissionsRoot` to provide permissions context:

```tsx
// App.tsx
import { PermissionsRoot } from 'react-auth-gate';
import { rules } from './permissions';

function App() {
  const currentUser = {
    id: '123',
    name: 'John Doe',
    role: 'editor' as const,
  };
  
  return (
    <PermissionsRoot
      user={currentUser}
      roles={['editor', 'user']}
      permissions={['post.create', 'post.edit']}
      rules={rules}
      flags={{ newUI: true }}
    >
      <YourApp />
    </PermissionsRoot>
  );
}
```

## Step 3: Use Permission Gates

Protect components with declarative gates:

```tsx
// UserProfile.tsx
import { PermissionsGate } from 'react-auth-gate';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      
      {/* Only show edit button if user has permission */}
      <PermissionsGate allow="user.edit" resource={user}>
        <button>Edit Profile</button>
      </PermissionsGate>
    </div>
  );
}
```

## Step 4: Use Permission Hooks

Check permissions programmatically:

```tsx
// EditButton.tsx
import { usePermission } from 'react-auth-gate';

function EditPostButton({ post }) {
  const { allowed, loading } = usePermission('post.edit', post);
  
  return (
    <button disabled={!allowed || loading}>
      {loading ? 'Checking...' : 'Edit Post'}
    </button>
  );
}
```

## Step 5: Protect Routes

Guard entire routes:

```tsx
// AdminPage.tsx
import { ProtectedRoute } from 'react-auth-gate';
import { Navigate } from 'react-router-dom';

function AdminPage() {
  return (
    <ProtectedRoute
      allow="admin.access"
      fallback={<Navigate to="/" />}
    >
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

## Step 6: Use the Dev Panel

In development, click the 🔐 icon in the bottom-right to open the dev panel:

- See all permission checks in real-time
- Override roles and permissions for testing
- Toggle feature flags
- Debug why checks pass or fail

## Common Patterns

### Hide vs Disable

```tsx
// Hide the button completely
<PermissionsGate allow="admin.access" mode="hide">
  <DeleteButton />
</PermissionsGate>

// Show disabled button
<PermissionsGate allow="admin.access" mode="disable">
  <DeleteButton />
</PermissionsGate>
```

### Multiple Permissions

```tsx
// Any of these permissions (OR)
<PermissionsGate any={['admin', 'moderator']}>
  <ModeratorPanel />
</PermissionsGate>

// All of these permissions (AND)
<PermissionsGate all={['post.edit', 'post.publish']}>
  <PublishButton />
</PermissionsGate>
```

### Fallback Content

```tsx
<PermissionsGate
  allow="premium.feature"
  fallback={<div>Upgrade to access this feature</div>}
>
  <PremiumContent />
</PermissionsGate>
```

### Inline Rules

```tsx
<PermissionsGate
  allow={({ user }) => user.email.endsWith('@company.com')}
>
  <InternalFeature />
</PermissionsGate>
```

### Render Props

```tsx
<Permissioned allow="post.edit" resource={post}>
  {(allowed, loading) => (
    <button disabled={!allowed}>
      {loading ? 'Checking...' : allowed ? 'Edit' : 'View'}
    </button>
  )}
</Permissioned>
```

## Next Steps

- Read the full [README.md](./README.md) for complete API documentation
- Check out [example.tsx](./example.tsx) for more usage patterns
- Explore the dev panel to understand permission flows
- Write tests for your permission rules

## Need Help?

- Open an issue on GitHub
- Check the examples in the repository
- Read the TypeScript types for detailed documentation

## TypeScript Tips

Enable strict mode in your `tsconfig.json` for the best experience:

```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["react"]
  }
}
```

Define your types for better IntelliSense:

```tsx
import { PermissionRule } from 'react-auth-gate';

// Your custom types
interface MyUser { /* ... */ }
interface MyResource { /* ... */ }

// Typed rules
const myRule: PermissionRule<MyUser, MyResource> = ({ user, resource }) => {
  // Full type safety!
  return user.id === resource.ownerId;
};
```

Happy coding!
