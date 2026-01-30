/**
 * Permissioned Component
 * 
 * Render-prop version of PermissionsGate for more control.
 * Passes the permission result to a render function.
 */

import React, { ReactNode } from 'react';
import { usePermission } from './usePermission';
import type { PermissionCheck } from '../core/types';

export interface PermissionedProps<TUser = any, TResource = any> {
  /**
   * Permission check to evaluate
   */
  allow: PermissionCheck<TUser, TResource>;
  
  /**
   * Resource to check permission against
   */
  resource?: TResource;
  
  /**
   * Render function that receives permission result
   */
  children: (allowed: boolean, loading: boolean) => ReactNode;
}

/**
 * Permissioned Component
 * 
 * Render-prop pattern for permission checking.
 * Gives you full control over how to render based on permission state.
 * 
 * @example
 * ```tsx
 * <Permissioned allow="user.edit" resource={user}>
 *   {(allowed, loading) => (
 *     <button disabled={!allowed || loading}>
 *       {loading ? 'Checking...' : allowed ? 'Edit' : 'View Only'}
 *     </button>
 *   )}
 * </Permissioned>
 * ```
 */
export function Permissioned<TUser = any, TResource = any>({
  allow,
  resource,
  children,
}: PermissionedProps<TUser, TResource>) {
  const { allowed, loading } = usePermission(allow, resource);
  
  return <>{children(allowed, loading)}</>;
}
