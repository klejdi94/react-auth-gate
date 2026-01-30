/**
 * react-permissions-gate
 * 
 * A production-grade React authorization framework for RBAC, PBAC, ABAC,
 * feature flags, and async permission checks.
 * 
 * @packageDocumentation
 */

// Core types
export type {
  PermissionContext,
  PermissionRule,
  PermissionRulesMap,
  PermissionCheck,
  PermissionMode,
  PermissionsConfig,
  PermissionsContextValue,
  PermissionEvaluation,
  RuleEvaluationResult,
  DevToolsState,
} from './core/types';

// React components
export { PermissionsProvider, usePermissionsContext } from './react/PermissionsProvider';
export { PermissionsGate } from './react/PermissionsGate';
export type { PermissionsGateProps } from './react/PermissionsGate';
export { Permissioned } from './react/Permissioned';
export type { PermissionedProps } from './react/Permissioned';
export { ProtectedRoute } from './react/ProtectedRoute';
export type { ProtectedRouteProps } from './react/ProtectedRoute';

// Hooks
export { usePermission, usePermissionValue } from './react/usePermission';

// Dev tools (auto-integrated root)
export { PermissionsRoot } from './devtools/PermissionsRoot';
export { DevPanel } from './devtools/DevPanel';
export { devStore } from './devtools/DevStore';

// Core utilities (advanced usage)
export {
  evaluatePermission,
  evaluateRule,
  resolveStringRule,
  createPermissionContext,
} from './core/ruleEngine';
