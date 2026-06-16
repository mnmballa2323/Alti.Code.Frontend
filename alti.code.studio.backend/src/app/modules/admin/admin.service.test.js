import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service.js';
import { prisma } from '../../../config/prisma.js';
import { UserRepository } from '../auth/prisma.user.repository.js';
import mongoose from 'mongoose';

vi.mock('../../../config/prisma.js', () => {
    return {
        prisma: {
            user: {
                findUnique: vi.fn(),
                delete: vi.fn(),
            }
        }
    };
});

vi.mock('../auth/prisma.user.repository.js', () => {
    return {
        UserRepository: {
            findById: vi.fn(),
            deleteUser: vi.fn(),
        }
    };
});

describe('AdminService - deleteUserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete user via prisma if id is a valid UUID', async () => {
        const uuid = '84644de4-219b-4e40-84ea-55cefe3c71cd';
        prisma.user.findUnique.mockResolvedValue({ id: uuid, role: 'user' });
        prisma.user.delete.mockResolvedValue({ id: uuid });

        const result = await AdminService.deleteUserService(uuid);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: uuid } });
        expect(result).toEqual({ id: uuid });
    });

    it('should delete user via UserRepository fallback if id is a valid legacy Mongo ID', async () => {
        const mongoId = new mongoose.Types.ObjectId().toString();
        UserRepository.findById.mockResolvedValue({ id: mongoId, role: 'user' });
        UserRepository.deleteUser.mockResolvedValue({ id: mongoId });

        const result = await AdminService.deleteUserService(mongoId);

        expect(UserRepository.findById).toHaveBeenCalledWith(mongoId);
        expect(UserRepository.deleteUser).toHaveBeenCalledWith(mongoId);
        expect(result).toEqual({ id: mongoId });
    });

    it('should throw error if id is neither a UUID nor a Mongo ID', async () => {
        await expect(AdminService.deleteUserService('invalid-id')).rejects.toThrow(
            'Invalid user ID format'
        );
    });

    it('should throw error if attempting to delete an admin user', async () => {
        const uuid = '84644de4-219b-4e40-84ea-55cefe3c71cd';
        prisma.user.findUnique.mockResolvedValue({ id: uuid, role: 'admin' });

        await expect(AdminService.deleteUserService(uuid)).rejects.toThrow(
            'Cannot delete an admin user'
        );
    });
});
