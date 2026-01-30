/**
 * PermissionsRoot
 * 
 * Enhanced wrapper around PermissionsProvider that automatically
 * integrates the Dev Panel in development mode.
 */

import React, { ReactNode } from 'react';
import { PermissionsProvider } from '../react/PermissionsProvider';
import { DevPanel } from './DevPanel';
import { useDevRegister, useDevToolsState } from './useDevRegister';
import type { PermissionsConfig } from '../core/types';

interface PermissionsRootProps<TUser = any> extends PermissionsConfig<TUser> {
  children: ReactNode;
}

/**
 * PermissionsRoot Component
 * 
 * Use this instead of PermissionsProvider to get automatic Dev Panel integration.
 * In production, this behaves exactly like PermissionsProvider.
 * 
 * @example
 * ```tsx
 * import { PermissionsRoot } from 'react-permissions-gate';
 * 
 * <PermissionsRoot
 *   user={currentUser}
 *   roles={['admin']}
 *   rules={rules}
 * >
 *   <App />
 * </PermissionsRoot>
 * ```
 */
export function PermissionsRoot<TUser = any>(props: PermissionsRootProps<TUser>) {
  const registerEvaluation = useDevRegister();
  const devState = useDevToolsState();
  
  // Apply dev tools overrides if they exist
  const effectiveRoles = devState.overrideRoles ?? props.roles ?? [];
  const effectivePermissions = devState.overridePermissions ?? props.permissions ?? [];
  const effectiveFlags = devState.overrideFlags ?? props.flags ?? {};
  
  // Create a key to force remount when overrides change
  const overrideKey = JSON.stringify({
    roles: devState.overrideRoles,
    permissions: devState.overridePermissions,
    flags: devState.overrideFlags,
  });
  
  return (
    <PermissionsProvider 
      key={overrideKey}
      {...props}
      roles={effectiveRoles}
      permissions={effectivePermissions}
      flags={effectiveFlags}
      onEvaluationRegister={registerEvaluation}
    >
      {props.children}
      <DevPanel />
    </PermissionsProvider>
  );
}
