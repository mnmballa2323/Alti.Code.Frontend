/**
 * Copyright (c) 2026 Inso Code
 * 
 * Enterprise IAM Strategies
 * 
 * Provides pluggable authentication flows for Enterprise SSO integration
 * including SAML 2.0 (Okta, Ping, Azure AD) and OpenID Connect.
 * Enforces strict JIT (Just-In-Time) provisioning into multi-tenant structure.
 */

import { Strategy as SamlStrategy } from 'passport-saml';
import { Strategy as OIDCStrategy } from 'passport-openidconnect';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Handles Just-In-Time (JIT) provisioning for SSO users into the correct Enterprise Tenant.
 */
const handleSSOUser = async (profile, tenantId, ssoProvider) => {
    // 1. Ensure Tenant exists (or create it for demonstration, though in production 
    //    tenant is usually pre-provisioned via an enterprise sales contract).
    let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                id: tenantId,
                name: `Enterprise_Tenant_${ssoProvider}`,
                domain: profile.email ? profile.email.split('@')[1] : 'enterprise.local',
                maxAgents: 50,
                memoryLimitGB: 1024,
            }
        });
    }

    // 2. Upsert the User
    const user = await prisma.user.upsert({
        where: { email: profile.email || profile.nameID },
        update: {
            ssoProvider,
            ssoId: profile.sub || profile.nameID,
            lastLogin: new Date(),
        },
        create: {
            email: profile.email || profile.nameID,
            password: crypto.randomBytes(32).toString('hex'), // Unusable password for SSO-only
            role: 'USER', // Default mapped role, can be derived from SAML claims
            tenantId: tenant.id,
            ssoProvider,
            ssoId: profile.sub || profile.nameID,
        }
    });

    // 3. Optional: Map SAML/OIDC roles/groups to our RBAC
    // if (profile.groups && profile.groups.includes('Admins')) {
    //     await prisma.user.update({ where: { id: user.id }, data: { role: 'TENANT_ADMIN' } });
    // }

    return user;
};

/**
 * Factory for creating dynamic SAML strategies per tenant config
 */
export const createSamlStrategy = (tenantConfig) => {
    return new SamlStrategy(
        {
            path: `/api/v1/auth/saml/callback`,
            entryPoint: tenantConfig.samlEntryPoint,
            issuer: 'insocode',
            cert: tenantConfig.samlCert,
            audience: tenantConfig.samlAudience,
            passReqToCallback: true
        },
        async (req, profile, done) => {
            try {
                // Determine tenant context from SAML relay state or static config
                const tenantId = req.query.tenantId || tenantConfig.tenantId;
                const user = await handleSSOUser(profile, tenantId, 'SAML2.0');
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    );
};

/**
 * Factory for creating dynamic OIDC strategies per tenant config
 */
export const createOIDCStrategy = (tenantConfig) => {
    return new OIDCStrategy({
        issuer: tenantConfig.oidcIssuer,
        authorizationURL: tenantConfig.oidcAuthUrl,
        tokenURL: tenantConfig.oidcTokenUrl,
        userInfoURL: tenantConfig.oidcUserInfoUrl,
        clientID: tenantConfig.oidcClientId,
        clientSecret: tenantConfig.oidcClientSecret,
        callbackURL: `/api/v1/auth/oidc/callback`,
        scope: 'openid profile email'
    },
    async (issuer, profile, done) => {
        try {
            const tenantId = tenantConfig.tenantId; // Derived from instance setup
            const user = await handleSSOUser(profile, tenantId, 'OIDC');
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    });
};
