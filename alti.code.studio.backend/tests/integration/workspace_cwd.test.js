global.self = global;
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Workspace CWD Dynamic Switching Integration Tests', () => {
    let GitAgentController;
    const originalCwd = process.cwd();
    const tempTestDir = path.join(originalCwd, 'temp_test_workspace_cwd');

    beforeAll(async () => {
        // Create temp test directory
        await fs.mkdir(tempTestDir, { recursive: true });

        // Dynamically import GitAgentController
        const controllerModule = await import('../../src/app/modules/gitAgent/gitAgent.controller.js');
        GitAgentController = controllerModule.GitAgentController;
    });

    afterAll(async () => {
        // Restore original working directory
        process.chdir(originalCwd);
        // Clean up temp directory
        try {
            await fs.rm(tempTestDir, { recursive: true, force: true });
        } catch (e) {}
    });

    it('GitAgentController: should expose changeDirectory method', () => {
        expect(GitAgentController.changeDirectory).toBeTypeOf('function');
    });

    it('GitAgentController.changeDirectory: should fail if path is missing', async () => {
        let statusCode, success, message;
        const mockReq = { body: {} };
        const promise = new Promise((resolve) => {
            const mockRes = {
                status: (code) => {
                    statusCode = code;
                    return mockRes;
                },
                json: (payload) => {
                    success = payload.success;
                    message = payload.message;
                    resolve();
                    return mockRes;
                }
            };
            const mockNext = (err) => {
                resolve();
            };
            GitAgentController.changeDirectory(mockReq, mockRes, mockNext);
        });

        await promise;
        expect(statusCode).toBe(400);
        expect(success).toBe(false);
        expect(message).toContain('Path is required');
    });

    it('GitAgentController.changeDirectory: should switch CWD to a valid directory path', async () => {
        let statusCode, success, data;
        const mockReq = { body: { path: tempTestDir } };
        const promise = new Promise((resolve) => {
            const mockRes = {
                status: (code) => {
                    statusCode = code;
                    return mockRes;
                },
                json: (payload) => {
                    success = payload.success;
                    data = payload.data;
                    resolve();
                    return mockRes;
                }
            };
            const mockNext = (err) => {
                resolve();
            };
            GitAgentController.changeDirectory(mockReq, mockRes, mockNext);
        });

        await promise;
        expect(statusCode).toBe(200);
        expect(success).toBe(true);
        expect(data.path).toBe(tempTestDir);
        expect(process.cwd()).toBe(tempTestDir);
    });

    it('GitAgentController.changeDirectory: should fail and return 500 for invalid/non-existent paths', async () => {
        let statusCode, success, message;
        const mockReq = { body: { path: path.join(tempTestDir, 'non_existent_folder_abc') } };
        const promise = new Promise((resolve) => {
            const mockRes = {
                status: (code) => {
                    statusCode = code;
                    return mockRes;
                },
                json: (payload) => {
                    success = payload.success;
                    message = payload.message;
                    resolve();
                    return mockRes;
                }
            };
            const mockNext = (err) => {
                resolve();
            };
            GitAgentController.changeDirectory(mockReq, mockRes, mockNext);
        });

        await promise;
        expect(statusCode).toBe(500);
        expect(success).toBe(false);
        expect(message).toContain('Failed to change directory');
    });
});
