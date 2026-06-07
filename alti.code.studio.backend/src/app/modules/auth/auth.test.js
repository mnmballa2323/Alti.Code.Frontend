/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service.js'; // Named export 'authService'
import UserModel from './auth.model.js';
import config from '../../../../config/index.js';

// Mock dependencies
vi.mock('./auth.model.js', () => {
    return {
        default: {
            isUserExist: vi.fn(),
            create: vi.fn(),
            findOne: vi.fn(),
            deleteOne: vi.fn(),
            updateOne: vi.fn(),
        }
    };
});

vi.mock('../../../shared/logger.js', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loginUser', () => {
        it('should throw error if user does not exist', async () => {
            const loginData = { email: 'test@example.com', password: 'password123' };
            UserModel.findOne.mockReturnValue({
                select: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue(null) // User not found
            });

            await expect(authService.loginService(loginData.email, loginData.password)).rejects.toThrow();
        });

        // Note: Real password hashing check requires deeper mocking of bcrypt
        // For now, we verify the service structure handles the database call.
    });

    // Add more tests for register, etc.
});
