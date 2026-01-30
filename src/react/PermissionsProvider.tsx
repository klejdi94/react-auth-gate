/**
 * PermissionsProvider
 * 
 * Root provider component that establishes permission context for the entire app.
 * Manages user, roles, permissions, rules, and feature flags.
 */

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import type {
  PermissionsConfig,
  PermissionsContextValue,
  PermissionCheck,
  PermissionEvaluation,
} from '../core/types';
import {
  evaluatePermission as evaluatePermissionCore,
  createPermissionContext,
} from '../core/ruleEngine';

// Create the context
const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Hook to access the permissions context
 * Throws if used outside of PermissionsProvider
 */
export function usePermissionsContext<TUser = any>(): PermissionsContextValue<TUser> {
  const context = useContext(PermissionsContext);
  
  if (!context) {
    throw new Error(
      'usePermissionsContext must be used within a PermissionsProvider'
    );
  }
  
  return context as PermissionsContextValue<TUser>;
}

interface PermissionsProviderProps<TUser = any> extends PermissionsConfig<TUser> {
  children: ReactNode;
  /** Internal: Dev tools registration callback */
  onEvaluationRegister?: (evaluation: PermissionEvaluation) => void;
}

/**
 * PermissionsProvider Component
 * 
 * Wrap your app with this provider to enable permission checking throughout.
 * 
 * @example
 * ```tsx
 * <PermissionsProvider
 *   user={currentUser}
 *   roles={['admin', 'editor']}
 *   permissions={['post.edit', 'post.delete']}
 *   rules={customRules}
 *   flags={{ newUI: true }}
 * >
 *   <App />
 * </PermissionsProvider>
 * ```
 */
export function PermissionsProvider<TUser = any>({
  user,
  roles = [],
  permissions = [],
  rules = {},
  flags = {},
  enableDevTools,
  children,
  onEvaluationRegister,
}: PermissionsProviderProps<TUser>) {
  // Auto-enable dev tools in development unless explicitly disabled
  const devToolsEnabled = useMemo(() => {
    if (enableDevTools !== undefined) {
      return enableDevTools;
    }
    
    // Check if we're in development mode
    return process.env.NODE_ENV !== 'production';
  }, [enableDevTools]);
  
  /**
   * Core permission evaluation function
   * Used by all permission-checking components and hooks
   */
  const evaluatePermission = useCallback(
    async <TResource = any>(
      check: PermissionCheck<TUser, TResource>,
      resource?: TResource,
      mode: 'any' | 'all' = 'any'
    ): Promise<boolean> => {
      const context = createPermissionContext(
        user,
        resource,
        roles,
        permissions,
        flags
      );
      
      const startTime = performance.now();
      const result = await evaluatePermissionCore(check, context, rules, mode);
      
      // Register with dev tools if enabled
      if (devToolsEnabled && onEvaluationRegister) {
        const evaluation: PermissionEvaluation = {
          id: `eval-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          check: typeof check === 'function' ? 'inline' : check,
          resource,
          allowed: result.allowed,
          ruleResults: result.ruleResults,
          mode,
        };
        
        onEvaluationRegister(evaluation);
      }
      
      return result.allowed;
    },
    [user, roles, permissions, rules, flags, devToolsEnabled, onEvaluationRegister]
  );
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<PermissionsContextValue<TUser>>(
    () => ({
      user,
      roles,
      permissions,
      rules,
      flags,
      enableDevTools: devToolsEnabled,
      evaluatePermission,
      registerEvaluation: onEvaluationRegister,
    }),
    [
      user,
      roles,
      permissions,
      rules,
      flags,
      devToolsEnabled,
      evaluatePermission,
      onEvaluationRegister,
    ]
  );
  
  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}
