/**
 * Core types for react-permissions-gate
 * 
 * Defines the type system for permission checking, rule evaluation,
 * and context management across the library.
 */

/**
 * Permission evaluation context passed to rule functions
 */
export interface PermissionContext<TUser = any, TResource = any> {
  /** Current authenticated user */
  user: TUser;
  /** Optional resource being accessed */
  resource?: TResource;
  /** Array of role strings assigned to the user */
  roles: string[];
  /** Array of permission strings granted to the user */
  permissions: string[];
  /** Feature flags map */
  flags: Record<string, boolean>;
}

/**
 * Permission rule function signature
 * Can return boolean synchronously or Promise<boolean> for async checks
 */
export type PermissionRule<TUser = any, TResource = any> = (
  ctx: PermissionContext<TUser, TResource>
) => boolean | Promise<boolean>;

/**
 * Map of named permission rules
 */
export type PermissionRulesMap<TUser = any, TResource = any> = Record<
  string,
  PermissionRule<TUser, TResource>
>;

/**
 * Permission check input - can be a rule key, array of keys, or inline function
 */
export type PermissionCheck<TUser = any, TResource = any> =
  | string
  | string[]
  | PermissionRule<TUser, TResource>;

/**
 * Mode for rendering behavior when permission is denied
 */
export type PermissionMode = 'hide' | 'disable';

/**
 * Configuration for the PermissionsProvider
 */
export interface PermissionsConfig<TUser = any> {
  /** Current authenticated user */
  user: TUser;
  /** Array of role strings */
  roles?: string[];
  /** Array of permission strings */
  permissions?: string[];
  /** Named permission rules */
  rules?: PermissionRulesMap<TUser, any>;
  /** Feature flags */
  flags?: Record<string, boolean>;
  /** Enable dev tools panel (defaults to process.env.NODE_ENV !== 'production') */
  enableDevTools?: boolean;
}

/**
 * Internal context value exposed by PermissionsProvider
 */
export interface PermissionsContextValue<TUser = any> {
  user: TUser;
  roles: string[];
  permissions: string[];
  rules: PermissionRulesMap<TUser, any>;
  flags: Record<string, boolean>;
  enableDevTools: boolean;
  
  /** Internal: Evaluate a permission check */
  evaluatePermission: <TResource = any>(
    check: PermissionCheck<TUser, TResource>,
    resource?: TResource,
    mode?: 'any' | 'all'
  ) => Promise<boolean>;
  
  /** Internal: Register permission evaluation for dev tools */
  registerEvaluation?: (evaluation: PermissionEvaluation) => void;
}

/**
 * Result of a permission evaluation (used by dev tools)
 */
export interface PermissionEvaluation {
  /** Unique ID for this evaluation */
  id: string;
  /** Timestamp of evaluation */
  timestamp: number;
  /** Permission check that was evaluated */
  check: string | string[];
  /** Resource involved (if any) */
  resource?: any;
  /** Result of the check */
  allowed: boolean;
  /** Details about which rules were evaluated */
  ruleResults: RuleEvaluationResult[];
  /** Component that triggered this check (if available) */
  component?: string;
  /** Evaluation mode (any/all) */
  mode?: 'any' | 'all';
}

/**
 * Result of evaluating a single rule
 */
export interface RuleEvaluationResult {
  /** Rule key or 'inline' for inline functions */
  rule: string;
  /** Result of the rule evaluation */
  result: boolean;
  /** Time taken to evaluate (ms) */
  duration: number;
  /** Error if rule threw */
  error?: string;
}

/**
 * Dev tools state
 */
export interface DevToolsState {
  /** All permission evaluations */
  evaluations: PermissionEvaluation[];
  /** Whether dev panel is open */
  isOpen: boolean;
  /** Override user context for testing */
  overrideUser?: any;
  /** Override roles for testing */
  overrideRoles?: string[];
  /** Override permissions for testing */
  overridePermissions?: string[];
  /** Override flags for testing */
  overrideFlags?: Record<string, boolean>;
}
