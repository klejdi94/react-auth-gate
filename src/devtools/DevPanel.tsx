/**
 * DevPanel Component
 * 
 * The killer feature: automatic development panel for permission debugging.
 * Shows all permission checks, allows context overrides, and provides live feedback.
 */

import React, { useState, useMemo } from 'react';
import { devStore } from './DevStore';
import { useDevToolsState } from './useDevRegister';
import { usePermissionsContext } from '../react/PermissionsProvider';
import type { PermissionEvaluation } from '../core/types';

const PANEL_STYLES = {
  container: {
    position: 'fixed' as const,
    bottom: 0,
    right: 0,
    width: '450px',
    maxHeight: '600px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: 'monospace',
    fontSize: '12px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column' as const,
    borderTopLeftRadius: '8px',
  },
  header: {
    padding: '12px 16px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #3e3e3e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '8px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#4fc3f7',
  },
  button: {
    background: 'none',
    border: '1px solid #4fc3f7',
    color: '#4fc3f7',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '11px',
    borderRadius: '3px',
    marginLeft: '8px',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
  },
  tab: {
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'inline-block',
  },
  activeTab: {
    borderBottom: '2px solid #4fc3f7',
    color: '#4fc3f7',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#252525',
    borderBottom: '1px solid #3e3e3e',
  },
  evaluation: {
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#252525',
    borderRadius: '4px',
    borderLeft: '3px solid',
  },
  allowed: {
    borderLeftColor: '#4caf50',
  },
  denied: {
    borderLeftColor: '#f44336',
  },
  timestamp: {
    fontSize: '10px',
    color: '#888',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    marginRight: '4px',
    marginTop: '4px',
  },
  successBadge: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  errorBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  toggle: {
    position: 'fixed' as const,
    bottom: '10px',
    right: '10px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#4fc3f7',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 999998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    color: '#4fc3f7',
  },
  checkbox: {
    marginRight: '6px',
  },
  label: {
    display: 'block',
    padding: '4px 0',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '6px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #3e3e3e',
    color: '#d4d4d4',
    borderRadius: '3px',
    marginTop: '4px',
    fontFamily: 'monospace',
    fontSize: '11px',
  },
};

type TabType = 'evaluations' | 'overrides' | 'context';

/**
 * DevPanel Component
 * Automatically shown in development mode
 */
export function DevPanel() {
  const state = useDevToolsState();
  const context = usePermissionsContext();
  const [activeTab, setActiveTab] = useState<TabType>('evaluations');
  
  if (!context.enableDevTools) {
    return null;
  }
  
  // Apply overrides to current context
  const effectiveRoles = state.overrideRoles || context.roles;
  const effectivePermissions = state.overridePermissions || context.permissions;
  const effectiveFlags = state.overrideFlags || context.flags;
  
  return (
    <>
      {/* Toggle button */}
      {!state.isOpen && (
        <button
          style={PANEL_STYLES.toggle}
          onClick={() => devStore.togglePanel()}
          title="Open Permissions Dev Panel"
        >
          🔐
        </button>
      )}
      
      {/* Panel */}
      {state.isOpen && (
        <div style={PANEL_STYLES.container}>
          {/* Header */}
          <div style={PANEL_STYLES.header}>
            <h3 style={PANEL_STYLES.title}>🔐 Permissions Dev Panel</h3>
            <div>
              <button
                style={PANEL_STYLES.button}
                onClick={() => devStore.clearEvaluations()}
              >
                Clear
              </button>
              <button
                style={PANEL_STYLES.button}
                onClick={() => devStore.setOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div style={PANEL_STYLES.tabs}>
            <div
              style={{
                ...PANEL_STYLES.tab,
                ...(activeTab === 'evaluations' ? PANEL_STYLES.activeTab : {}),
              }}
              onClick={() => setActiveTab('evaluations')}
            >
              Evaluations ({state.evaluations.length})
            </div>
            <div
              style={{
                ...PANEL_STYLES.tab,
                ...(activeTab === 'overrides' ? PANEL_STYLES.activeTab : {}),
              }}
              onClick={() => setActiveTab('overrides')}
            >
              Overrides
            </div>
            <div
              style={{
                ...PANEL_STYLES.tab,
                ...(activeTab === 'context' ? PANEL_STYLES.activeTab : {}),
              }}
              onClick={() => setActiveTab('context')}
            >
              Context
            </div>
          </div>
          
          {/* Content */}
          <div style={PANEL_STYLES.content}>
            {activeTab === 'evaluations' && (
              <EvaluationsTab evaluations={state.evaluations} />
            )}
            {activeTab === 'overrides' && (
              <OverridesTab
                roles={context.roles}
                permissions={context.permissions}
                flags={context.flags}
                effectiveRoles={effectiveRoles}
                effectivePermissions={effectivePermissions}
                effectiveFlags={effectiveFlags}
              />
            )}
            {activeTab === 'context' && (
              <ContextTab
                user={context.user}
                roles={effectiveRoles}
                permissions={effectivePermissions}
                flags={effectiveFlags}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Evaluations tab content
 */
function EvaluationsTab({ evaluations }: { evaluations: PermissionEvaluation[] }) {
  if (evaluations.length === 0) {
    return <div style={{ color: '#888' }}>No permission checks yet...</div>;
  }
  
  return (
    <div>
      {evaluations.map((evaluation) => (
        <div
          key={evaluation.id}
          style={{
            ...PANEL_STYLES.evaluation,
            ...(evaluation.allowed ? PANEL_STYLES.allowed : PANEL_STYLES.denied),
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <strong style={{ color: evaluation.allowed ? '#4caf50' : '#f44336' }}>
              {evaluation.allowed ? '✓ ALLOWED' : '✗ DENIED'}
            </strong>
            <span style={{ marginLeft: '8px', color: '#d4d4d4' }}>
              {typeof evaluation.check === 'string'
                ? evaluation.check
                : Array.isArray(evaluation.check)
                ? evaluation.check.join(', ')
                : 'inline function'}
            </span>
          </div>
          
          <div style={PANEL_STYLES.timestamp}>
            {new Date(evaluation.timestamp).toLocaleTimeString()}
            {evaluation.mode && ` • mode: ${evaluation.mode}`}
          </div>
          
          <div style={{ marginTop: '6px' }}>
            {evaluation.ruleResults.map((result, idx) => (
              <span
                key={idx}
                style={{
                  ...PANEL_STYLES.badge,
                  ...(result.result ? PANEL_STYLES.successBadge : PANEL_STYLES.errorBadge),
                }}
                title={`${result.duration.toFixed(2)}ms${result.error ? ` - ${result.error}` : ''}`}
              >
                {result.rule}: {result.result ? '✓' : '✗'}
              </span>
            ))}
          </div>
          
          {evaluation.resource && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#888' }}>
              Resource: {JSON.stringify(evaluation.resource).slice(0, 50)}...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Overrides tab content
 */
function OverridesTab({
  roles,
  permissions,
  flags,
  effectiveRoles,
  effectivePermissions,
  effectiveFlags,
}: {
  roles: string[];
  permissions: string[];
  flags: Record<string, boolean>;
  effectiveRoles: string[];
  effectivePermissions: string[];
  effectiveFlags: Record<string, boolean>;
}) {
  const [newRole, setNewRole] = useState('');
  const [newPermission, setNewPermission] = useState('');
  const [newFlag, setNewFlag] = useState('');
  
  // Collect all unique roles and permissions from evaluations
  const allRoles = useMemo(() => {
    const rolesSet = new Set([...roles, ...effectiveRoles]);
    return Array.from(rolesSet).sort();
  }, [roles, effectiveRoles]);
  
  const allPermissions = useMemo(() => {
    const permsSet = new Set([...permissions, ...effectivePermissions]);
    return Array.from(permsSet).sort();
  }, [permissions, effectivePermissions]);
  
  return (
    <div>
      {/* Reset button */}
      <button
        style={{
          ...PANEL_STYLES.button,
          width: '100%',
          marginBottom: '16px',
        }}
        onClick={() => devStore.resetOverrides()}
      >
        Reset All Overrides
      </button>
      
      {/* Roles */}
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Roles</div>
        {allRoles.map((role) => (
          <label key={role} style={PANEL_STYLES.label}>
            <input
              type="checkbox"
              style={PANEL_STYLES.checkbox}
              checked={effectiveRoles.includes(role)}
              onChange={() => devStore.toggleRole(role, roles)}
            />
            {role}
          </label>
        ))}
        <input
          type="text"
          style={PANEL_STYLES.input}
          placeholder="Add new role..."
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newRole) {
              devStore.toggleRole(newRole, roles);
              setNewRole('');
            }
          }}
        />
      </div>
      
      {/* Permissions */}
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Permissions</div>
        {allPermissions.map((permission) => (
          <label key={permission} style={PANEL_STYLES.label}>
            <input
              type="checkbox"
              style={PANEL_STYLES.checkbox}
              checked={effectivePermissions.includes(permission)}
              onChange={() => devStore.togglePermission(permission, permissions)}
            />
            {permission}
          </label>
        ))}
        <input
          type="text"
          style={PANEL_STYLES.input}
          placeholder="Add new permission..."
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newPermission) {
              devStore.togglePermission(newPermission, permissions);
              setNewPermission('');
            }
          }}
        />
      </div>
      
      {/* Feature Flags */}
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Feature Flags</div>
        {Object.entries(effectiveFlags).map(([flag, value]) => (
          <label key={flag} style={PANEL_STYLES.label}>
            <input
              type="checkbox"
              style={PANEL_STYLES.checkbox}
              checked={value}
              onChange={() => devStore.toggleFlag(flag, flags)}
            />
            {flag}
          </label>
        ))}
        <input
          type="text"
          style={PANEL_STYLES.input}
          placeholder="Add new flag..."
          value={newFlag}
          onChange={(e) => setNewFlag(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newFlag) {
              devStore.toggleFlag(newFlag, flags);
              setNewFlag('');
            }
          }}
        />
      </div>
    </div>
  );
}

/**
 * Context tab content
 */
function ContextTab({
  user,
  roles,
  permissions,
  flags,
}: {
  user: any;
  roles: string[];
  permissions: string[];
  flags: Record<string, boolean>;
}) {
  return (
    <div>
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>User</div>
        <pre style={{ fontSize: '10px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Roles ({roles.length})</div>
        <div>{roles.length > 0 ? roles.join(', ') : 'None'}</div>
      </div>
      
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Permissions ({permissions.length})</div>
        <div>{permissions.length > 0 ? permissions.join(', ') : 'None'}</div>
      </div>
      
      <div style={PANEL_STYLES.section}>
        <div style={PANEL_STYLES.sectionTitle}>Feature Flags</div>
        <pre style={{ fontSize: '10px' }}>
          {JSON.stringify(flags, null, 2)}
        </pre>
      </div>
    </div>
  );
}
