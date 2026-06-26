import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from './prisma.user.repository.js';
import { prisma } from '../../../config/prisma.js';
import fs from 'fs/promises';

vi.mock('../../../config/prisma.js', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

vi.mock('fs', () => {
  return {
    existsSync: vi.fn(),
  };
});

describe('UserRepository - Local JSON Async Fallback Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Force database methods to throw so it always falls back to mock users
    prisma.user.findUnique.mockRejectedValue(new Error('DB Offline'));
    prisma.user.findFirst.mockRejectedValue(new Error('DB Offline'));
    prisma.user.update.mockRejectedValue(new Error('DB Offline'));
    prisma.user.delete.mockRejectedValue(new Error('DB Offline'));
  });

  it('should find user by email from mock storage when DB is offline', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    const { existsSync } = await import('fs');
    existsSync.mockReturnValue(true);
    fs.readFile.mockResolvedValue(JSON.stringify(mockUsers));

    const user = await UserRepository.findByEmail('test@example.com');
    expect(user).toEqual(mockUsers[0]);
    expect(fs.readFile).toHaveBeenCalled();
  });

  it('should delete user from mock storage when DB is offline', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    const { existsSync } = await import('fs');
    existsSync.mockReturnValue(true);
    fs.readFile.mockResolvedValue(JSON.stringify(mockUsers));
    fs.writeFile.mockResolvedValue(undefined);

    const deleted = await UserRepository.deleteUser('1');
    expect(deleted).toEqual(mockUsers[0]);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify([], null, 2),
      'utf8',
    );
  });
});
