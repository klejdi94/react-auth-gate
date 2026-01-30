/**
 * DevStore
 * 
 * Centralized state management for dev tools.
 * Tracks all permission evaluations and provides override capabilities.
 */

import type { PermissionEvaluation, DevToolsState } from '../core/types';

/**
 * Dev tools store
 * Simple observable pattern for managing dev panel state
 */
export class DevStore {
  private state: DevToolsState = {
    evaluations: [],
    isOpen: false,
    overrideUser: undefined,
    overrideRoles: undefined,
    overridePermissions: undefined,
    overrideFlags: undefined,
  };
  
  private listeners: Set<(state: DevToolsState) => void> = new Set();
  
  /**
   * Get current state
   */
  getState(): DevToolsState {
    return { ...this.state };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: DevToolsState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of state change
   */
  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }
  
  /**
   * Add a permission evaluation
   */
  addEvaluation(evaluation: PermissionEvaluation) {
    this.state.evaluations = [evaluation, ...this.state.evaluations].slice(0, 100); // Keep last 100
    this.notify();
  }
  
  /**
   * Clear all evaluations
   */
  clearEvaluations() {
    this.state.evaluations = [];
    this.notify();
  }
  
  /**
   * Toggle panel open/closed
   */
  togglePanel() {
    this.state.isOpen = !this.state.isOpen;
    this.notify();
  }
  
  /**
   * Set panel open state
   */
  setOpen(isOpen: boolean) {
    this.state.isOpen = isOpen;
    this.notify();
  }
  
  /**
   * Set override user for testing
   */
  setOverrideUser(user: any) {
    this.state.overrideUser = user;
    this.notify();
  }
  
  /**
   * Set override roles for testing
   */
  setOverrideRoles(roles: string[] | undefined) {
    this.state.overrideRoles = roles;
    this.notify();
  }
  
  /**
   * Set override permissions for testing
   */
  setOverridePermissions(permissions: string[] | undefined) {
    this.state.overridePermissions = permissions;
    this.notify();
  }
  
  /**
   * Set override flags for testing
   */
  setOverrideFlags(flags: Record<string, boolean> | undefined) {
    this.state.overrideFlags = flags;
    this.notify();
  }
  
  /**
   * Toggle a specific role
   */
  toggleRole(role: string, currentRoles: string[]) {
    const overrideRoles = this.state.overrideRoles || [...currentRoles];
    const index = overrideRoles.indexOf(role);
    
    if (index > -1) {
      overrideRoles.splice(index, 1);
    } else {
      overrideRoles.push(role);
    }
    
    this.setOverrideRoles(overrideRoles.length > 0 ? overrideRoles : undefined);
  }
  
  /**
   * Toggle a specific permission
   */
  togglePermission(permission: string, currentPermissions: string[]) {
    const overridePermissions = this.state.overridePermissions || [...currentPermissions];
    const index = overridePermissions.indexOf(permission);
    
    if (index > -1) {
      overridePermissions.splice(index, 1);
    } else {
      overridePermissions.push(permission);
    }
    
    this.setOverridePermissions(overridePermissions.length > 0 ? overridePermissions : undefined);
  }
  
  /**
   * Toggle a feature flag
   */
  toggleFlag(flag: string, currentFlags: Record<string, boolean>) {
    const overrideFlags = this.state.overrideFlags || { ...currentFlags };
    overrideFlags[flag] = !overrideFlags[flag];
    
    this.setOverrideFlags(overrideFlags);
  }
  
  /**
   * Reset all overrides
   */
  resetOverrides() {
    this.state.overrideUser = undefined;
    this.state.overrideRoles = undefined;
    this.state.overridePermissions = undefined;
    this.state.overrideFlags = undefined;
    this.notify();
  }
}

/**
 * Global dev store instance
 */
export const devStore = new DevStore();
