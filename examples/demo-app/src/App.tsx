import { useState } from 'react';
import {
  PermissionsRoot,
  PermissionsGate,
  usePermission,
  Permissioned,
  PermissionRulesMap,
} from 'react-permissions-gate';

// Types
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

// Sample users
const USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Editor User', email: 'editor@example.com', role: 'editor' },
  { id: '3', name: 'Viewer User', email: 'viewer@example.com', role: 'viewer' },
];

// Sample posts
const POSTS: Post[] = [
  { id: 'post-1', title: 'My First Post', authorId: '2', published: true },
  { id: 'post-2', title: 'Draft Post', authorId: '2', published: false },
  { id: 'post-3', title: 'Admin Post', authorId: '1', published: true },
];

// Permission rules
const rules: PermissionRulesMap<User, any> = {
  // Check roles array instead of user.role
  'admin.access': ({ roles }) => roles.includes('admin'),
  
  'user.edit': ({ user, resource, roles }) =>
    roles.includes('admin') || user.id === resource?.id,
  
  'post.create': ({ roles }) =>
    roles.includes('admin') || roles.includes('editor'),
  
  'post.edit': ({ user, resource, roles }) => {
    if (!resource) return false;
    return roles.includes('admin') || user.id === resource.authorId;
  },
  
  'post.delete': ({ user, resource, roles }) => {
    if (!resource) return false;
    return roles.includes('admin') || user.id === resource.authorId;
  },
  
  'post.publish': ({ user, resource, roles }) => {
    if (!resource) return false;
    return roles.includes('admin') || 
           (roles.includes('editor') && user.id === resource.authorId);
  },
};

function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[1]); // Start with editor

  return (
    <PermissionsRoot
      user={currentUser}
      roles={[currentUser.role, 'user']}
      permissions={
        currentUser.role === 'admin' 
          ? ['post.create', 'post.edit', 'post.delete', 'post.publish']
          : currentUser.role === 'editor'
          ? ['post.create', 'post.edit']
          : []
      }
      rules={rules}
      flags={{ newUI: true, betaFeatures: false }}
    >
      <div className="app">
        <header className="app-header">
          <h1>🔐 React Permissions Gate</h1>
          <p>Interactive Demo - Try different user roles and watch permissions change!</p>
        </header>

        {/* User Selector */}
        <section className="section">
          <h2>Select User Role</h2>
          <div className="user-selector">
            {USERS.map((user) => (
              <div
                key={user.id}
                className={`user-card ${currentUser.id === user.id ? 'active' : ''}`}
                onClick={() => setCurrentUser(user)}
              >
                <h4>{user.name}</h4>
                <p>{user.email}</p>
                <span className="badge role">{user.role}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="demo-info">
          <p>
            <strong>👤 Current User:</strong> {currentUser.name} ({currentUser.role})
            <br />
            <strong>💡 Tip:</strong> Click the 🔐 icon in the bottom-right to open the Dev Panel and see live permission checks!
          </p>
        </div>

        {/* Admin Only Section */}
        <section className="section">
          <h2>1. Admin-Only Content (Role-Based)</h2>
          <PermissionsGate allow="admin.access">
            <div className="card">
              <h3>🎉 Admin Dashboard</h3>
              <p>This content is only visible to administrators.</p>
              <button className="button">Manage Users</button>
              <button className="button">System Settings</button>
            </div>
          </PermissionsGate>
          <PermissionsGate
            allow="admin.access"
            fallback={
              <div className="card">
                <span className="badge denied">Access Denied</span>
                <p>You need admin role to see this content.</p>
              </div>
            }
          />
        </section>

        {/* User Profile Section */}
        <section className="section">
          <h2>2. Edit Own Profile (Resource-Based)</h2>
          <div className="card">
            <h3>Profile: {currentUser.name}</h3>
            <p>Email: {currentUser.email}</p>
            <PermissionsGate allow="user.edit" resource={currentUser}>
              <button className="button">✏️ Edit My Profile</button>
            </PermissionsGate>
            <PermissionsGate allow="user.edit" resource={USERS[0]}>
              <button className="button">Edit Admin Profile</button>
            </PermissionsGate>
            <PermissionsGate
              allow="user.edit"
              resource={USERS[0]}
              fallback={<span className="badge denied">Can't edit other users</span>}
            />
          </div>
        </section>

        {/* Post Management */}
        <section className="section">
          <h2>3. Post Management (Permission-Based)</h2>
          <PermissionsGate allow="post.create">
            <button className="button success">➕ Create New Post</button>
          </PermissionsGate>
          <PermissionsGate
            allow="post.create"
            fallback={<span className="badge denied">No create permission</span>}
          />
          
          <div style={{ marginTop: '20px' }}>
            {POSTS.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
          </div>
        </section>

        {/* Hook Example */}
        <section className="section">
          <h2>4. Using usePermission Hook</h2>
          <HookExample currentUser={currentUser} />
        </section>

        {/* Render Prop Example */}
        <section className="section">
          <h2>5. Permissioned Render Prop</h2>
          <div className="card">
            <Permissioned allow="admin.access">
              {(allowed, loading) => (
                <button className="button" disabled={!allowed || loading}>
                  {loading ? 'Checking...' : allowed ? '✓ Admin Action' : '✗ Not Admin'}
                </button>
              )}
            </Permissioned>
          </div>
        </section>

        {/* Multiple Permissions */}
        <section className="section">
          <h2>6. Multiple Permissions</h2>
          <div className="card">
            <h3>ANY Permission (OR logic)</h3>
            <PermissionsGate any={['admin.access', 'post.create']}>
              <span className="badge success">Has admin OR create permission ✓</span>
            </PermissionsGate>
            
            <h3 style={{ marginTop: '20px' }}>ALL Permissions (AND logic)</h3>
            <PermissionsGate all={['post.create', 'post.edit']}>
              <span className="badge success">Has both create AND edit ✓</span>
            </PermissionsGate>
            <PermissionsGate
              all={['post.create', 'post.edit']}
              fallback={<span className="badge denied">Missing some permissions</span>}
            />
          </div>
        </section>

        {/* Disable Mode */}
        <section className="section">
          <h2>7. Disable Mode (vs Hide)</h2>
          <div className="card">
            <h3>Hide Mode (default)</h3>
            <PermissionsGate allow="admin.access" mode="hide">
              <button className="button">Hidden Button</button>
            </PermissionsGate>
            <p>Button above only renders if you're admin.</p>
            
            <h3 style={{ marginTop: '20px' }}>Disable Mode</h3>
            <PermissionsGate allow="admin.access" mode="disable">
              <button className="button">Disabled Button</button>
            </PermissionsGate>
            <p>Button above always renders but disabled if not admin.</p>
          </div>
        </section>

        {/* Dev Panel Instructions */}
        <div className="dev-panel-hint">
          <h3>🛠️ Try the Dev Panel!</h3>
          <p>
            Click the <strong>🔐 icon</strong> in the bottom-right corner to open the permission debugger.
            You can:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>See all permission checks in real-time</li>
            <li>Override roles and permissions to test scenarios</li>
            <li>Toggle feature flags without code changes</li>
            <li>Debug why permissions pass or fail</li>
          </ul>
        </div>
      </div>
    </PermissionsRoot>
  );
}

// Post Card Component
function PostCard({ post, currentUser }: { post: Post; currentUser: User }) {
  const { allowed: canEdit } = usePermission('post.edit', post);
  const { allowed: canDelete } = usePermission('post.delete', post);
  const { allowed: canPublish } = usePermission('post.publish', post);

  return (
    <div className="card">
      <h3>{post.title}</h3>
      <p>
        <span className="badge">{post.published ? '✓ Published' : '📝 Draft'}</span>
        <span className="badge">Author ID: {post.authorId}</span>
      </p>
      <div>
        <PermissionsGate allow="post.edit" resource={post}>
          <button className="button">✏️ Edit</button>
        </PermissionsGate>
        <PermissionsGate allow="post.delete" resource={post}>
          <button className="button danger">🗑️ Delete</button>
        </PermissionsGate>
        <PermissionsGate allow="post.publish" resource={post}>
          <button className="button success">📢 Publish</button>
        </PermissionsGate>
        {!canEdit && !canDelete && !canPublish && (
          <span className="badge denied">View Only</span>
        )}
      </div>
    </div>
  );
}

// Hook Example Component
function HookExample({ currentUser }: { currentUser: User }) {
  const { allowed: canCreate, loading: createLoading } = usePermission('post.create');
  const { allowed: isAdmin, loading: adminLoading } = usePermission('admin.access');

  return (
    <div className="card">
      <h3>Permission Checks via Hook</h3>
      <p>
        <strong>Can create posts:</strong>{' '}
        {createLoading ? '⏳ Checking...' : canCreate ? '✓ Yes' : '✗ No'}
      </p>
      <p>
        <strong>Is admin:</strong>{' '}
        {adminLoading ? '⏳ Checking...' : isAdmin ? '✓ Yes' : '✗ No'}
      </p>
      <div className="code">
        {`const { allowed, loading } = usePermission('post.create');`}
      </div>
    </div>
  );
}

export default App;
