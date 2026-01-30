/**
 * Rule Engine
 * 
 * Core logic for evaluating permission rules against a context.
 * Supports sync/async rules, string-based rules, and inline functions.
 */

import type {
  PermissionContext,
  PermissionRule,
  PermissionRulesMap,
  PermissionCheck,
  RuleEvaluationResult,
} from './types';

/**
 * Evaluates a single permission rule
 * 
 * @param rule - The rule function to evaluate
 * @param context - The permission context
 * @returns Promise resolving to rule result and evaluation metadata
 */
export async function evaluateRule<TUser = any, TResource = any>(
  rule: PermissionRule<TUser, TResource>,
  context: PermissionContext<TUser, TResource>
): Promise<{ result: boolean; duration: number; error?: string }> {
  const startTime = performance.now();
  
  try {
    const result = await Promise.resolve(rule(context));
    const duration = performance.now() - startTime;
    
    return {
      result: Boolean(result),
      duration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    
    return {
      result: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Resolves a string-based permission key to a rule function
 * 
 * Strategy:
 * 1. Check if it exists in the rules map
 * 2. Check if it's in the permissions array (direct permission grant)
 * 3. Check if it's in the roles array (role-based grant)
 * 4. Otherwise deny
 */
export function resolveStringRule<TUser = any, TResource = any>(
  permissionKey: string,
  rulesMap: PermissionRulesMap<TUser, TResource>,
  context: PermissionContext<TUser, TResource>
): PermissionRule<TUser, TResource> {
  // If a custom rule exists for this key, use it
  if (rulesMap[permissionKey]) {
    return rulesMap[permissionKey];
  }
  
  // Otherwise, check if the permission/role is directly granted
  return (ctx: PermissionContext<TUser, TResource>) => {
    return ctx.permissions.includes(permissionKey) || ctx.roles.includes(permissionKey);
  };
}

/**
 * Evaluates a permission check (string, array, or function)
 * 
 * @param check - The permission check to evaluate
 * @param context - The permission context
 * @param rulesMap - Map of named rules
 * @param mode - Evaluation mode: 'any' (OR) or 'all' (AND)
 * @returns Promise resolving to evaluation result and metadata
 */
export async function evaluatePermission<TUser = any, TResource = any>(
  check: PermissionCheck<TUser, TResource>,
  context: PermissionContext<TUser, TResource>,
  rulesMap: PermissionRulesMap<TUser, TResource>,
  mode: 'any' | 'all' = 'any'
): Promise<{
  allowed: boolean;
  ruleResults: RuleEvaluationResult[];
}> {
  const ruleResults: RuleEvaluationResult[] = [];
  
  // Case 1: Inline function rule
  if (typeof check === 'function') {
    const evaluation = await evaluateRule(check, context);
    
    ruleResults.push({
      rule: 'inline',
      result: evaluation.result,
      duration: evaluation.duration,
      error: evaluation.error,
    });
    
    return {
      allowed: evaluation.result,
      ruleResults,
    };
  }
  
  // Case 2: Single string permission
  if (typeof check === 'string') {
    const rule = resolveStringRule(check, rulesMap, context);
    const evaluation = await evaluateRule(rule, context);
    
    ruleResults.push({
      rule: check,
      result: evaluation.result,
      duration: evaluation.duration,
      error: evaluation.error,
    });
    
    return {
      allowed: evaluation.result,
      ruleResults,
    };
  }
  
  // Case 3: Array of permission strings
  if (Array.isArray(check)) {
    const evaluations = await Promise.all(
      check.map(async (key) => {
        const rule = resolveStringRule(key, rulesMap, context);
        const evaluation = await evaluateRule(rule, context);
        
        return {
          rule: key,
          result: evaluation.result,
          duration: evaluation.duration,
          error: evaluation.error,
        };
      })
    );
    
    ruleResults.push(...evaluations);
    
    // Apply mode logic
    const allowed =
      mode === 'all'
        ? evaluations.every((e) => e.result)
        : evaluations.some((e) => e.result);
    
    return {
      allowed,
      ruleResults,
    };
  }
  
  // Invalid check type
  return {
    allowed: false,
    ruleResults: [
      {
        rule: 'unknown',
        result: false,
        duration: 0,
        error: 'Invalid permission check type',
      },
    ],
  };
}

/**
 * Creates a permission context from configuration values
 */
export function createPermissionContext<TUser = any, TResource = any>(
  user: TUser,
  resource: TResource | undefined,
  roles: string[],
  permissions: string[],
  flags: Record<string, boolean>
): PermissionContext<TUser, TResource> {
  return {
    user,
    resource,
    roles,
    permissions,
    flags,
  };
}
