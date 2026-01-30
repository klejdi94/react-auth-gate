/**
 * ProtectedRoute Component
 * 
 * Wrapper for route protection based on permissions.
 * Works with any routing library (React Router, Next.js, etc.)
 */

import React, { ReactNode } from 'react';
import { usePermission } from './usePermission';
import type { PermissionCheck } from '../core/types';

export interface ProtectedRouteProps<TUser = any, TResource = any> {
  /**
   * Permission check required to access this route
   */
  allow: PermissionCheck<TUser, TResource>;
  
  /**
   * Resource to check permission against (optional)
   */
  resource?: TResource;
  
  /**
   * Content to render when permission is granted
   */
  children: ReactNode;
  
  /**
   * Content to render when permission is denied
   * Typically a redirect or unauthorized message
   */
  fallback?: ReactNode;
  
  /**
   * Optional callback when access is denied
   * Useful for analytics, logging, or custom redirects
   */
  onAccessDenied?: () => void;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on permissions.
 * Framework-agnostic - works with any routing solution.
 * 
 * @example
 * ```tsx
 * // With React Router
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute
 *       allow="admin"
 *       fallback={<Navigate to="/login" />}
 *     >
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   }
 * />
 * 
 * // With Next.js
 * function AdminPage() {
 *   const router = useRouter();
 *   
 *   return (
 *     <ProtectedRoute
 *       allow="admin"
 *       onAccessDenied={() => router.push('/login')}
 *       fallback={<div>Redirecting...</div>}
 *     >
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Resource-based protection
 * <ProtectedRoute
 *   allow="post.edit"
 *   resource={post}
 *   fallback={<Unauthorized />}
 * >
 *   <EditPost post={post} />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute<TUser = any, TResource = any>({
  allow,
  resource,
  children,
  fallback = <DefaultUnauthorized />,
  onAccessDenied,
}: ProtectedRouteProps<TUser, TResource>) {
  const { allowed, loading } = usePermission(allow, resource);
  
  // Call onAccessDenied when permission is denied (only once)
  React.useEffect(() => {
    if (!loading && !allowed && onAccessDenied) {
      onAccessDenied();
    }
  }, [loading, allowed, onAccessDenied]);
  
  // While loading, show nothing or a loading indicator
  if (loading) {
    return <DefaultLoading />;
  }
  
  // Permission denied
  if (!allowed) {
    return <>{fallback}</>;
  }
  
  // Permission granted
  return <>{children}</>;
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      Loading...
    </div>
  );
}

/**
 * Default unauthorized component
 */
function DefaultUnauthorized() {
  return (
    <div
      style={{
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1>Access Denied</h1>
      <p>You do not have permission to access this resource.</p>
    </div>
  );
}
