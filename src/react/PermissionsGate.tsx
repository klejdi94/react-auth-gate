/**
 * PermissionsGate Component
 * 
 * Declarative permission boundary for your components.
 * Automatically hides or disables children based on permission checks.
 */

import React, { ReactNode, ReactElement, cloneElement } from 'react';
import { usePermission } from './usePermission';
import type { PermissionCheck, PermissionMode } from '../core/types';

export interface PermissionsGateProps<TUser = any, TResource = any> {
  /**
   * Primary permission check
   * Can be a string, array of strings, or inline rule function
   */
  allow?: PermissionCheck<TUser, TResource>;
  
  /**
   * Array of permissions where ANY must pass (OR logic)
   * Alternative to `allow` - cannot be used together
   */
  any?: string[];
  
  /**
   * Array of permissions where ALL must pass (AND logic)
   * Alternative to `allow` - cannot be used together
   */
  all?: string[];
  
  /**
   * Resource to check permission against
   */
  resource?: TResource;
  
  /**
   * Fallback content to render when permission is denied
   * If not provided and mode is 'hide', nothing is rendered
   */
  fallback?: ReactNode;
  
  /**
   * How to handle denied permissions:
   * - 'hide': Don't render children at all (default)
   * - 'disable': Render children but add disabled prop
   */
  mode?: PermissionMode;
  
  /**
   * Children to protect with permission check
   */
  children: ReactNode;
}

/**
 * PermissionsGate Component
 * 
 * Wraps components with permission-based access control.
 * 
 * @example
 * ```tsx
 * // Hide button if user can't edit
 * <PermissionsGate allow="user.edit" resource={user}>
 *   <EditButton />
 * </PermissionsGate>
 * 
 * // Disable button instead of hiding
 * <PermissionsGate allow="post.delete" resource={post} mode="disable">
 *   <DeleteButton />
 * </PermissionsGate>
 * 
 * // Check multiple permissions (any)
 * <PermissionsGate any={["admin", "moderator"]}>
 *   <AdminPanel />
 * </PermissionsGate>
 * 
 * // Check multiple permissions (all)
 * <PermissionsGate all={["post.edit", "post.publish"]}>
 *   <PublishButton />
 * </PermissionsGate>
 * 
 * // Show fallback when denied
 * <PermissionsGate allow="premium.feature" fallback={<UpgradePrompt />}>
 *   <PremiumFeature />
 * </PermissionsGate>
 * ```
 */
export function PermissionsGate<TUser = any, TResource = any>({
  allow,
  any,
  all,
  resource,
  fallback,
  mode = 'hide',
  children,
}: PermissionsGateProps<TUser, TResource>) {
  // Determine the permission check and evaluation mode
  let check: PermissionCheck<TUser, TResource>;
  let evalMode: 'any' | 'all' = 'any';
  
  if (allow !== undefined) {
    check = allow;
    evalMode = 'any';
  } else if (any !== undefined) {
    check = any;
    evalMode = 'any';
  } else if (all !== undefined) {
    check = all;
    evalMode = 'all';
  } else {
    // No permission check specified - deny by default
    console.warn(
      'PermissionsGate: No permission check specified (allow, any, or all). Denying access.'
    );
    return fallback ? <>{fallback}</> : null;
  }
  
  const { allowed, loading } = usePermission(check, resource, evalMode);
  
  // While loading, optionally show loading state
  // For now, we treat loading as "not allowed" for security
  if (loading) {
    return mode === 'hide' ? null : <>{children}</>;
  }
  
  // Permission denied
  if (!allowed) {
    if (mode === 'hide') {
      return fallback ? <>{fallback}</> : null;
    }
    
    // mode === 'disable'
    // Try to add disabled prop to children
    return <>{disableChildren(children)}</>;
  }
  
  // Permission granted
  return <>{children}</>;
}

/**
 * Helper function to add disabled prop to React elements
 */
function disableChildren(children: ReactNode): ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    
    // Clone element with disabled prop
    // This works for standard HTML elements and components that accept disabled prop
    return cloneElement(child as ReactElement<any>, {
      disabled: true,
      'aria-disabled': true,
      style: {
        ...((child as ReactElement<any>).props.style || {}),
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    });
  });
}
