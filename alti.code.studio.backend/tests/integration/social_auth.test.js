/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import passport from 'passport';
import googleStrategy from '../../src/app/modules/auth/google.strategy.js';
import githubStrategy from '../../src/app/modules/auth/github.strategy.js';
import { UserRepository } from '../../src/app/modules/auth/prisma.user.repository.js';
import { authService } from '../../src/app/modules/auth/auth.service.js';

// Initialize Passport Strategies for the test instance
passport.use('google', googleStrategy);
passport.use('github', githubStrategy);

// Mock Prisma client
vi.mock('../../src/config/prisma.js', () => {
    const mockPrisma = {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        tenant: {
            create: vi.fn().mockResolvedValue({ id: 'mock-tenant-id' })
        },
        $transaction: vi.fn((callback) => callback(mockPrisma))
    };
    return { prisma: mockPrisma };
});

import { prisma } from '../../src/config/prisma.js';

describe('OAuth Integration Tests (Google & GitHub)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Passport Strategy Registrations', () => {
        it('should have google and github strategies registered in passport', () => {
            const strategies = passport._strategies;
            expect(strategies).toBeDefined();
            expect(strategies.google).toBeDefined();
            expect(strategies.github).toBeDefined();
        });
    });

    describe('UserRepository.upsertSocialUser Persistence Logic', () => {
        it('should CREATE a new user (Sign Up) if email does not exist', async () => {
            const payload = {
                email: 'newsocial@example.com',
                id: '123456789',
                provider: 'google',
                avatar: 'https://avatar.com/new',
            };

            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'uuid-123',
                email: payload.email,
                googleId: payload.id,
                githubId: null,
                avatar: payload.avatar,
                provider: 'google',
                role: 'user',
            });

            const user = await UserRepository.upsertSocialUser(payload);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: payload.email }
            });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: payload.email,
                    googleId: payload.id,
                    githubId: null,
                    avatar: payload.avatar,
                    provider: 'google',
                    role: 'user',
                    tenantId: 'mock-tenant-id',
                    tenantRole: 'owner',
                }
            });
            expect(user.googleId).toBe(payload.id);
            expect(user.email).toBe(payload.email);
        });

        it('should LINK and return the user (Sign In) if email already exists', async () => {
            const payload = {
                email: 'existingsocial@example.com',
                id: '987654321',
                provider: 'github',
                avatar: 'https://avatar.com/github-pic',
            };

            const existingUser = {
                id: 'uuid-existing',
                email: payload.email,
                googleId: 'google-id-already-linked',
                githubId: null,
                avatar: 'https://avatar.com/old',
                role: 'user',
            };

            prisma.user.findUnique.mockResolvedValue(existingUser);
            prisma.user.update.mockResolvedValue({
                ...existingUser,
                githubId: payload.id,
                avatar: payload.avatar,
            });

            const user = await UserRepository.upsertSocialUser(payload);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: payload.email }
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: existingUser.id },
                data: {
                    googleId: 'google-id-already-linked',
                    githubId: payload.id,
                    avatar: payload.avatar,
                    role: 'user',
                }
            });
            expect(user.githubId).toBe(payload.id);
            expect(user.googleId).toBe('google-id-already-linked');
        });
    });

    describe('JWT Token Issuance for Social Handshakes', () => {
        it('should generate valid access and refresh tokens for social user', () => {
            const mockUser = {
                id: 'uuid-token-user',
                role: 'user',
            };

            const tokens = authService.generateUserTokens(mockUser);
            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
        });
    });
});
