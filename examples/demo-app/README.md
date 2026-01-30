# React Auth Gate - Demo App

This is a live demo application showcasing all features of `react-auth-gate`.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🎯 What's Demonstrated

### 1. **Role-Based Access Control (RBAC)**
- Admin-only sections
- Role-based visibility

### 2. **Resource-Based Permissions (PBAC)**
- Edit own profile vs others
- Post ownership checks

### 3. **Permission-Based Access**
- Create, edit, delete permissions
- Multiple permission combinations

### 4. **Component Patterns**
- `<PermissionsGate>` with hide/disable modes
- `usePermission()` hook usage
- `<Permissioned>` render props
- Fallback content

### 5. **Dev Tools Panel**
- Live permission tracking
- Role/permission overrides
- Real-time debugging

## 👥 Sample Users

The demo includes three user roles:

1. **Admin User**
   - Full access to everything
   - Can edit all posts
   - Can delete any content

2. **Editor User**
   - Can create and edit own posts
   - Can't access admin features
   - Can edit own profile only

3. **Viewer User**
   - Read-only access
   - Can't create or edit
   - No admin access

## 🔐 Dev Panel

Click the **🔐 icon** in the bottom-right to open the permission debugger.

### Features:
- See all permission checks live
- Override roles to test scenarios
- Toggle permissions on/off
- Debug rule evaluation

## 📝 Code Examples

All patterns shown in this demo can be copied to your project:

- Check `src/App.tsx` for complete examples
- See permission rules definition
- Learn component usage patterns

## 🛠️ Building

```bash
npm run build
```

## 🎓 Learn More

- [Main Documentation](../../README.md)
- [Getting Started Guide](../../GETTING_STARTED.md)
- [Architecture Overview](../../ARCHITECTURE.md)

## 💡 Tips

1. Switch between different users to see permission changes
2. Use the dev panel to test edge cases
3. Check the console for evaluation logs (dev mode)
4. Try overriding permissions in the dev panel

Enjoy exploring react-auth-gate!
