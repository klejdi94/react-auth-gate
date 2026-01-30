/**
 * useDevRegister Hook
 * 
 * Internal hook used by the PermissionsProvider to integrate
 * with dev tools and track evaluations.
 */

import { useCallback, useEffect, useState } from 'react';
import { devStore } from './DevStore';
import type { PermissionEvaluation, DevToolsState } from '../core/types';

/**
 * Hook to register permission evaluations with dev tools
 * Returns a callback that should be passed to PermissionsProvider
 */
export function useDevRegister() {
  const registerEvaluation = useCallback((evaluation: PermissionEvaluation) => {
    devStore.addEvaluation(evaluation);
  }, []);
  
  return registerEvaluation;
}

/**
 * Hook to subscribe to dev tools state
 */
export function useDevToolsState(): DevToolsState {
  const [state, setState] = useState<DevToolsState>(devStore.getState());
  
  useEffect(() => {
    const unsubscribe = devStore.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return state;
}
