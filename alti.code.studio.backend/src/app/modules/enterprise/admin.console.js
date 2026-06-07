/**
 * Copyright (c) 2024 Inso Code
 * 
 * ADMIN CONSOLE API (Phase 53)
 * 
 * Platform-wide administration:
 *   - Tenant CRUD (create, update, suspend, delete)
 *   - User provisioning and deprovisioning
 *   - Team management with hierarchical roles
 *   - SSO group synchronization
 *   - Platform system controls (maintenance mode, feature flags)
 *   - Audit trail for all admin actions
 *   - Bulk operations (invite, remove, migrate)
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Admin Console
// ═══════════════════════════════════════════════

const ADMIN_ROLES = ['platform_admin', 'tenant_admin', 'billing_admin', 'security_admin', 'support'];

const FEATURE_FLAGS = {
    marketplace: { default: true, description: 'Agent marketplace access' },
    advanced_analytics: { default: false, description: 'Advanced analytics dashboard' },
    custom_agents: { default: false, description: 'Custom agent deployment' },
    data_export: { default: true, description: 'Data export capabilities' },
    api_access: { default: true, description: 'API key generation' },
    sso: { default: false, description: 'SSO/SAML integration' },
    multi_region: { default: false, description: 'Multi-region deployment' },
    workflow_engine: { default: true, description: 'Workflow automation' },
};

class AdminConsole {
    constructor() {
        this.tenants = new Map();        // tenantId → tenant details
        this.users = new Map();          // userId → user details
        this.teams = new Map();          // teamId → team details
        this.auditLog = [];
        this.systemState = {
            maintenanceMode: false,
            maintenanceMessage: '',
            featureFlags: { ...Object.fromEntries(Object.entries(FEATURE_FLAGS).map(([k, v]) => [k, v.default])) },
            announcements: [],
        };
        this.stats = { totalTenants: 0, totalUsers: 0, totalTeams: 0, totalActions: 0 };
    }

    // ── Tenant Management ──

    createTenant(data) {
        const tenantId = data.id || `tenant_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const tenant = {
            id: tenantId,
            name: data.name,
            domain: data.domain || null,
            plan: data.plan || 'starter',
            status: 'ACTIVE',
            owner: data.owner || null,
            settings: data.settings || {},
            featureOverrides: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.tenants.set(tenantId, tenant);
        this.stats.totalTenants++;
        this._audit('TENANT_CREATED', { tenantId, name: data.name });

        return tenant;
    }

    updateTenant(tenantId, updates) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

        Object.assign(tenant, updates, { updatedAt: new Date().toISOString() });
        this._audit('TENANT_UPDATED', { tenantId, updates: Object.keys(updates) });

        return tenant;
    }

    suspendTenant(tenantId, reason = '') {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

        tenant.status = 'SUSPENDED';
        tenant.suspendedAt = new Date().toISOString();
        tenant.suspendReason = reason;
        this._audit('TENANT_SUSPENDED', { tenantId, reason });

        return { tenantId, status: 'SUSPENDED' };
    }

    reactivateTenant(tenantId) {
        const tenant = this.tenants.get(tenantId);
        if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

        tenant.status = 'ACTIVE';
        delete tenant.suspendedAt;
        delete tenant.suspendReason;
        this._audit('TENANT_REACTIVATED', { tenantId });

        return { tenantId, status: 'ACTIVE' };
    }

    // ── User Provisioning ──

    provisionUser(data) {
        const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const user = {
            id: userId,
            email: data.email,
            name: data.name,
            tenantId: data.tenantId,
            role: data.role || 'member',
            teams: [],
            status: 'ACTIVE',
            ssoLinked: false,
            lastLogin: null,
            createdAt: new Date().toISOString(),
        };

        this.users.set(userId, user);
        this.stats.totalUsers++;
        this._audit('USER_PROVISIONED', { userId, email: data.email, tenantId: data.tenantId });

        return user;
    }

    deprovisionUser(userId) {
        const user = this.users.get(userId);
        if (!user) throw new Error(`User not found: ${userId}`);

        user.status = 'DEPROVISIONED';
        user.deprovisionedAt = new Date().toISOString();
        this._audit('USER_DEPROVISIONED', { userId, email: user.email });

        return { userId, status: 'DEPROVISIONED' };
    }

    updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user) throw new Error(`User not found: ${userId}`);
        Object.assign(user, updates);
        this._audit('USER_UPDATED', { userId, updates: Object.keys(updates) });
        return user;
    }

    // ── Team Management ──

    createTeam(data) {
        const teamId = `team_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const team = {
            id: teamId,
            name: data.name,
            tenantId: data.tenantId,
            description: data.description || '',
            members: [],
            permissions: data.permissions || [],
            createdAt: new Date().toISOString(),
        };

        this.teams.set(teamId, team);
        this.stats.totalTeams++;
        this._audit('TEAM_CREATED', { teamId, name: data.name });

        return team;
    }

    addTeamMember(teamId, userId) {
        const team = this.teams.get(teamId);
        if (!team) throw new Error(`Team not found: ${teamId}`);
        if (team.members.includes(userId)) return { alreadyMember: true };

        team.members.push(userId);
        const user = this.users.get(userId);
        if (user) user.teams.push(teamId);

        this._audit('TEAM_MEMBER_ADDED', { teamId, userId });
        return { teamId, userId, added: true };
    }

    removeTeamMember(teamId, userId) {
        const team = this.teams.get(teamId);
        if (!team) throw new Error(`Team not found: ${teamId}`);

        team.members = team.members.filter(m => m !== userId);
        const user = this.users.get(userId);
        if (user) user.teams = user.teams.filter(t => t !== teamId);

        this._audit('TEAM_MEMBER_REMOVED', { teamId, userId });
        return { teamId, userId, removed: true };
    }

    // ── System Controls ──

    setMaintenanceMode(enabled, message = '') {
        this.systemState.maintenanceMode = enabled;
        this.systemState.maintenanceMessage = message;
        this._audit('MAINTENANCE_MODE', { enabled, message });
        return { maintenanceMode: enabled };
    }

    setFeatureFlag(flag, enabled) {
        if (!(flag in FEATURE_FLAGS)) throw new Error(`Unknown feature flag: ${flag}`);
        this.systemState.featureFlags[flag] = enabled;
        this._audit('FEATURE_FLAG_CHANGED', { flag, enabled });
        return { flag, enabled };
    }

    addAnnouncement(message, severity = 'INFO') {
        const announcement = {
            id: `ann_${Date.now()}`,
            message,
            severity,
            active: true,
            createdAt: new Date().toISOString(),
        };
        this.systemState.announcements.push(announcement);
        this._audit('ANNOUNCEMENT_CREATED', { severity });
        return announcement;
    }

    getSystemState() {
        return { ...this.systemState };
    }

    // ── Bulk Operations ──

    bulkInvite(tenantId, emails) {
        const results = emails.map(email => {
            try {
                return this.provisionUser({ email, name: email.split('@')[0], tenantId });
            } catch (err) {
                return { email, error: err.message };
            }
        });
        return { invited: results.filter(r => r.id).length, failed: results.filter(r => r.error).length, results };
    }

    // ── Queries ──

    getTenant(tenantId) { return this.tenants.get(tenantId) || null; }
    getUser(userId) { return this.users.get(userId) || null; }
    getTeam(teamId) { return this.teams.get(teamId) || null; }

    listTenants(options = {}) {
        let tenants = [...this.tenants.values()];
        if (options.status) tenants = tenants.filter(t => t.status === options.status);
        if (options.plan) tenants = tenants.filter(t => t.plan === options.plan);
        return tenants;
    }

    listUsers(tenantId) {
        let users = [...this.users.values()];
        if (tenantId) users = users.filter(u => u.tenantId === tenantId);
        return users;
    }

    listTeams(tenantId) {
        let teams = [...this.teams.values()];
        if (tenantId) teams = teams.filter(t => t.tenantId === tenantId);
        return teams;
    }

    getAuditLog(limit = 50) {
        return this.auditLog.slice(-limit);
    }

    // ── Internal ──

    _audit(action, details) {
        this.auditLog.push({
            action,
            details,
            timestamp: new Date().toISOString(),
        });
        this.stats.totalActions++;
    }

    getStats() {
        return {
            totalTenants: this.stats.totalTenants,
            activeTenants: [...this.tenants.values()].filter(t => t.status === 'ACTIVE').length,
            totalUsers: this.stats.totalUsers,
            totalTeams: this.stats.totalTeams,
            totalActions: this.stats.totalActions,
            maintenanceMode: this.systemState.maintenanceMode,
            featureFlags: Object.keys(FEATURE_FLAGS).length,
            adminRoles: ADMIN_ROLES,
        };
    }
}

export const adminConsole = new AdminConsole();
export { ADMIN_ROLES, FEATURE_FLAGS };
