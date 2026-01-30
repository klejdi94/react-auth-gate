/**
 * Example Usage of react-permissions-gate
 * 
 * This file demonstrates all the features and usage patterns of the library.
 * Copy and adapt this code for your own projects.
 */

import React from 'react';
import {
  PermissionsRoot,
  PermissionsGate,
  usePermission,
  Permissioned,
  ProtectedRoute,
  PermissionRule,
  PermissionRulesMap,
} from './src/index';

// ============================================
// 1. Define your types
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface Post {
  id: string;
  title: string;
  authorId: string;
  published: boolean;
}

// ============================================
// 2. Define permission rules
// ============================================

const rules: PermissionRulesMap<User, Post> = {
  // Simple role check
  'admin.access': ({ user }) => user.role === 'admin',
  
  // Resource-based permission (PBAC)
  'user.edit': ({ user, resource }) => {
    // Admin can edit anyone, or user can edit themselves
    return user.role === 'admin' || user.id === resource?.id;
  },
  
  // Complex post permission (ABAC)
  'post.edit': ({ user, resource }) => {
    if (!resource) return false;
    
    // Admin can edit anything
    if (user.role === 'admin') return true;
    
    // Editor can edit their own posts
    if (user.role === 'editor' && user.id === resource.authorId) {
      return true;
    }
    
    return false;
  },
  
  // Post deletion (stricter)
  'post.delete': ({ user, resource }) => {
    if (!resource) return false;
    
    // Only admin or original author can delete
    return user.role === 'admin' || user.id === resource.authorId;
  },
  
  // Publish permission (editors only)
  'post.publish': ({ user, resource, permissions }) => {
    // Must be editor or admin AND post must be owned by user
    return (
      permissions.includes('post.publish') &&
      (user.role === 'admin' || user.id === resource?.authorId)
    );
  },
  
  // Feature flag example
  'feature.newUI': ({ flags }) => flags.newUI === true,
  
  // Async permission check (simulate API call)
  'subscription.premium': async ({ user }) => {
    // Simulate checking subscription status from API
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // In real app, you'd check actual subscription
    return user.role === 'admin'; // For demo, admins are premium
  },
};

// ============================================
// 3. Set up your app with PermissionsRoot
// ============================================

const currentUser: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'editor',
};

function App() {
  return (
    <PermissionsRoot
      user={currentUser}
      roles={['editor', 'user']}
      permissions={['post.edit', 'post.publish']}
      rules={rules}
      flags={{
        newUI: true,
        betaFeatures: false,
      }}
    >
      <MainApp />
    </PermissionsRoot>
  );
}

// ============================================
// 4. Use permission components
// ============================================

function MainApp() {
  const post: Post = {
    id: 'post-1',
    title: 'My First Post',
    authorId: '123',
    published: false,
  };
  
  const otherUserPost: Post = {
    id: 'post-2',
    title: 'Someone Else\'s Post',
    authorId: '456',
    published: true,
  };
  
  return (
    <div>
      <h1>react-permissions-gate Examples</h1>
      
      {/* Example 1: Simple hide/show */}
      <section>
        <h2>1. Basic PermissionsGate (hide mode)</h2>
        <PermissionsGate allow="admin.access">
          <div>🔐 Admin-only content</div>
        </PermissionsGate>
        
        <PermissionsGate allow="user.edit" resource={currentUser}>
          <button>Edit My Profile</button>
        </PermissionsGate>
      </section>
      
      {/* Example 2: Disable mode */}
      <section>
        <h2>2. Disable mode</h2>
        <PermissionsGate allow="post.delete" resource={post} mode="disable">
          <button>Delete Post</button>
        </PermissionsGate>
      </section>
      
      {/* Example 3: Fallback content */}
      <section>
        <h2>3. With fallback</h2>
        <PermissionsGate
          allow="subscription.premium"
          fallback={<div>⭐ Upgrade to Premium to access this feature</div>}
        >
          <div>🎉 Premium Feature Content</div>
        </PermissionsGate>
      </section>
      
      {/* Example 4: Multiple permissions (any) */}
      <section>
        <h2>4. Any of multiple permissions</h2>
        <PermissionsGate any={['admin.access', 'editor.access']}>
          <div>Content for admins OR editors</div>
        </PermissionsGate>
      </section>
      
      {/* Example 5: Multiple permissions (all) */}
      <section>
        <h2>5. All of multiple permissions</h2>
        <PermissionsGate all={['post.edit', 'post.publish']}>
          <div>Can both edit AND publish</div>
        </PermissionsGate>
      </section>
      
      {/* Example 6: Inline rule */}
      <section>
        <h2>6. Inline permission rule</h2>
        <PermissionsGate
          allow={({ user }) => user.email.endsWith('@example.com')}
        >
          <div>Internal users only</div>
        </PermissionsGate>
      </section>
      
      {/* Example 7: usePermission hook */}
      <section>
        <h2>7. usePermission hook</h2>
        <EditPostButton post={post} />
        <EditPostButton post={otherUserPost} />
      </section>
      
      {/* Example 8: Permissioned render prop */}
      <section>
        <h2>8. Permissioned render prop</h2>
        <Permissioned allow="post.publish" resource={post}>
          {(allowed, loading) => (
            <button disabled={!allowed || loading}>
              {loading ? 'Checking...' : allowed ? 'Publish Post' : 'Cannot Publish'}
            </button>
          )}
        </Permissioned>
      </section>
      
      {/* Example 9: Feature flags */}
      <section>
        <h2>9. Feature flags</h2>
        <PermissionsGate allow="feature.newUI">
          <div>✨ New UI enabled!</div>
        </PermissionsGate>
      </section>
    </div>
  );
}

// ============================================
// 5. Custom components using hooks
// ============================================

function EditPostButton({ post }: { post: Post }) {
  const { allowed, loading } = usePermission('post.edit', post);
  
  if (loading) {
    return <button disabled>Checking permissions...</button>;
  }
  
  return (
    <button disabled={!allowed} onClick={() => alert('Edit post: ' + post.title)}>
      {allowed ? `Edit "${post.title}"` : `View "${post.title}"`}
    </button>
  );
}

// ============================================
// 6. Protected routes example
// ============================================

function RouterExample() {
  return (
    <div>
      {/* Example with React Router */}
      <ProtectedRoute
        allow="admin.access"
        fallback={<div>You must be an admin to access this page</div>}
      >
        <AdminDashboard />
      </ProtectedRoute>
      
      {/* With redirect callback */}
      <ProtectedRoute
        allow="subscription.premium"
        onAccessDenied={() => {
          console.log('Access denied, redirecting...');
          // router.push('/upgrade');
        }}
      >
        <PremiumContent />
      </ProtectedRoute>
    </div>
  );
}

function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}

function PremiumContent() {
  return <div>Premium Content</div>;
}

// ============================================
// 7. Advanced: Dynamic permissions
// ============================================

function DynamicPermissionsExample() {
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  
  return (
    <div>
      {selectedPost && (
        <PermissionsGate allow="post.edit" resource={selectedPost}>
          <button>Edit Selected Post</button>
        </PermissionsGate>
      )}
    </div>
  );
}

// ============================================
// 8. Export the app
// ============================================

export default App;

// ============================================
// NOTES FOR DEVELOPERS
// ============================================

/**
 * Best Practices:
 * 
 * 1. Define rules centrally - never inline in components
 * 2. Use TypeScript for user and resource types
 * 3. Keep rules pure and testable
 * 4. Use resource-based checks for data access
 * 5. Leverage the dev panel in development
 * 6. Async rules work but add latency - use sparingly
 * 7. Test permission rules independently
 * 8. Use mode="disable" for better UX in some cases
 * 9. Combine with loading states for async rules
 * 10. Use PermissionsRoot for automatic dev tools
 * 
 * Dev Panel Tips:
 * - Opens automatically in development
 * - Click the 🔐 icon in bottom-right to open
 * - See all permission checks in real-time
 * - Override roles/permissions to test different scenarios
 * - Toggle feature flags without code changes
 * - Great for QA and debugging
 */
