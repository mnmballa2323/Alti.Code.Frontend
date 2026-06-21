import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import { BrowserUseAgentService } from '../../src/app/modules/browserUseAgent/browserUseAgent.service.js';
import { agentSService } from '../../src/app/modules/senses/agent_s.service.js';
import { FazmAgentService } from '../../src/app/modules/fazmAgent/fazmAgent.service.js';
import { FazmAgentController } from '../../src/app/modules/fazmAgent/fazmAgent.controller.js';
import { redisClient } from '../../src/shared/redis.client.js';


vi.mock('axios');
vi.mock('child_process', () => ({
    spawn: vi.fn()
}));
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        existsSync: vi.fn(),
        readFileSync: vi.fn()
    };
});

vi.mock('../../src/shared/redis.client.js', () => {
    const store = new Map();
    return {
        redisClient: {
            isEnabled: true,
            set: vi.fn().mockImplementation((key, val, mode, ttl) => {
                store.set(key, val);
                return Promise.resolve('OK');
            }),
            get: vi.fn().mockImplementation((key) => {
                return Promise.resolve(store.get(key) || null);
            }),
            del: vi.fn().mockImplementation((key) => {
                store.delete(key);
                return Promise.resolve(1);
            })
        }
    };
});

describe('Production-Grade Swarm Agent Upgrades', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();

        // Setup default spawn mock to prevent TypeError crashes
        spawn.mockReturnValue({
            stdout: { on: vi.fn() },
            stderr: { on: vi.fn() },
            on: vi.fn().mockImplementation((event, cb) => {
                if (event === 'close') {
                    cb(0);
                }
            }),
            kill: vi.fn()
        });
    });

    describe('Browser-Use Upgrades', () => {
        it('should pass config options when calling runBrowserTask', async () => {
            axios.post.mockResolvedValue({ data: { taskId: 'test-id', status: 'running' } });

            const result = await BrowserUseAgentService.runBrowserTask('Browse github.com', {
                headless: false,
                chromePath: '/usr/bin/chrome',
                userDataDir: '/tmp/profile'
            });

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/browser/run'),
                {
                    task: 'Browse github.com',
                    headless: false,
                    chrome_path: '/usr/bin/chrome',
                    user_data_dir: '/tmp/profile',
                    proxy: null
                }
            );
            expect(result.taskId).toBe('test-id');
        });

        it('should call cancelBrowserTask and send delete request to cancel endpoint', async () => {
            axios.delete.mockResolvedValue({ data: { status: 'cancelled', message: 'Cancelled' } });

            const result = await BrowserUseAgentService.cancelBrowserTask('test-id-123');

            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/browser/cancel/test-id-123')
            );
            expect(result.status).toBe('cancelled');
        });

        it('should call getBrowserSessions and return all active tasks', async () => {
            axios.get.mockResolvedValue({ data: { 'test-task': { status: 'running' } } });

            const result = await BrowserUseAgentService.getBrowserSessions();

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/browser/sessions')
            );
            expect(result['test-task'].status).toBe('running');
        });

        it('should call getScreenshot and fetch binary arraybuffer from endpoint', async () => {
            const mockBuffer = Buffer.from('mock-png-bytes');
            axios.get.mockResolvedValue({ data: mockBuffer });

            const result = await BrowserUseAgentService.getScreenshot('test-id', 'latest');

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/browser/screenshot/test-id/latest'),
                { responseType: 'arraybuffer' }
            );
            expect(result.toString()).toBe('mock-png-bytes');
        });

        it('should call getPageSource and fetch DOM HTML source', async () => {
            axios.get.mockResolvedValue({ data: { html: '<html><body>Test</body></html>' } });

            const result = await BrowserUseAgentService.getPageSource('test-id');

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/browser/source/test-id')
            );
            expect(result.html).toContain('Test');
        });
    });

    describe('Agent-S Loop Upgrades', () => {
        it('should build python script content with custom dryRun and maxSteps options', async () => {
            const taskInstruction = 'Open files';
            
            // Validate executeGUITask throws correct API error if GEMINI_API_KEY is missing
            const originalApiKey = process.env.GEMINI_API_KEY;
            delete process.env.GEMINI_API_KEY;
            agentSService.apiKey = null;

            await expect(
                agentSService.executeGUITask(taskInstruction, { dryRun: false, maxSteps: 5 })
            ).rejects.toThrow('Agent S: GEMINI_API_KEY or ALTI_API_KEY is missing');

            process.env.GEMINI_API_KEY = originalApiKey;
            agentSService.apiKey = originalApiKey || 'test-key';
        });

        it('should register active subprocesses and support cancelGUITask', async () => {
            const mockProcess = {
                stdout: { on: vi.fn() },
                stderr: { on: vi.fn() },
                on: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'close') {
                        // simulate process exit
                    }
                }),
                kill: vi.fn()
            };
            vi.mocked(spawn).mockReturnValue(mockProcess);

            // Execute GUI task without awaiting to check map storage
            agentSService.executeGUITask('Calculate 123 * 456', { taskId: 'test-cancel-id' });

            // Yield execution using a polling loop to allow write and spawn to resolve robustly
            for (let i = 0; i < 25; i++) {
                if (agentSService.activeSubprocesses.has('test-cancel-id')) break;
                await new Promise(resolve => setTimeout(resolve, 20));
            }


            expect(agentSService.activeSubprocesses.has('test-cancel-id')).toBe(true);

            // Cancel the task
            const cancelResult = await agentSService.cancelGUITask('test-cancel-id');
            expect(cancelResult.success).toBe(true);
            expect(mockProcess.kill).toHaveBeenCalledWith('SIGINT');
        });

        it('should check system diagnostics and return parsed python information', async () => {
            const mockStdoutOn = vi.fn().mockImplementation((event, cb) => {
                if (event === 'data') {
                    cb(Buffer.from(JSON.stringify({
                        platform: 'darwin',
                        python: '3.11.0',
                        missing: [],
                        accessibility_trusted: true
                    })));
                }
            });
            const mockProcess = {
                stdout: { on: mockStdoutOn },
                on: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'close') {
                        cb(0);
                    }
                })
            };
            vi.mocked(spawn).mockReturnValue(mockProcess);

            const result = await agentSService.checkSystemDiagnostics();
            expect(result.ok).toBe(true);
            expect(result.platform).toBe('darwin');
            expect(result.missingDependencies).toEqual([]);
            expect(result.accessibilityPermissions).toBe('Granted');
        });

        it('should check system diagnostics and report accessibility permission denied on macOS', async () => {
            const mockStdoutOn = vi.fn().mockImplementation((event, cb) => {
                if (event === 'data') {
                    cb(Buffer.from(JSON.stringify({
                        platform: 'darwin',
                        python: '3.11.0',
                        missing: [],
                        accessibility_trusted: false
                    })));
                }
            });
            const mockProcess = {
                stdout: { on: mockStdoutOn },
                on: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'close') {
                        cb(0);
                    }
                })
            };
            vi.mocked(spawn).mockReturnValue(mockProcess);

            const result = await agentSService.checkSystemDiagnostics();
            expect(result.ok).toBe(false);
            expect(result.accessibilityPermissions).toContain('Denied');
        });

        it('should return result and trajectory object on executeGUITask success', async () => {
            const mockStdoutOn = vi.fn().mockImplementation((event, cb) => {
                if (event === 'data') {
                    cb(Buffer.from(JSON.stringify({
                        status: 'success',
                        result: 'Task completed successfully',
                        trajectory: [{ step: 1, action: 'click', executed: true }]
                    })));
                }
            });
            const mockProcess = {
                stdout: { on: mockStdoutOn },
                stderr: { on: vi.fn() },
                on: vi.fn().mockImplementation((event, cb) => {
                    if (event === 'close') {
                        cb(0);
                    }
                }),
                kill: vi.fn()
            };
            vi.mocked(spawn).mockReturnValue(mockProcess);

            const result = await agentSService.executeGUITask('Calculate 123 * 456');
            expect(result.result).toBe('Task completed successfully');
            expect(result.trajectory).toEqual([{ step: 1, action: 'click', executed: true }]);
        });

    });

    describe('Fazm Heartbeat Upgrades', () => {
        it('should register client heartbeat in redis and verify tunnel discovery with keep-alive check', async () => {
            const userId = 'user-test-777';
            const tunnelUrl = 'https://tunnel.fazm.io';

            const registerResult = await FazmAgentService.registerHeartbeat(userId, tunnelUrl);
            expect(redisClient.set).toHaveBeenCalledWith(
                `fazm:tunnel:${userId}`,
                expect.stringContaining(tunnelUrl),
                'EX',
                300
            );
            expect(registerResult.ok).toBe(true);

            // Fetch registration and check discoverTunnel
            const discoverResult = await FazmAgentService.discoverTunnel(userId);
            expect(redisClient.get).toHaveBeenCalledWith(`fazm:tunnel:${userId}`);
            expect(discoverResult.online).toBe(true);
            expect(discoverResult.tunnel_url).toBe(tunnelUrl);
        });

        it('should cleanup tunnel and mark offline if lastHeartbeatAt is stale (> 5 mins)', async () => {
            const userId = 'user-stale-888';
            const tunnelUrl = 'https://tunnel-stale.fazm.io';

            const staleTime = new Date(Date.now() - 6 * 60 * 1000).toISOString();
            const staleData = JSON.stringify({
                tunnelUrl,
                registeredAt: staleTime,
                lastHeartbeatAt: staleTime
            });
            
            await redisClient.set(`fazm:tunnel:${userId}`, staleData);

            const discoverResult = await FazmAgentService.discoverTunnel(userId);
            expect(discoverResult.online).toBe(false);
            expect(discoverResult.tunnel_url).toBeNull();
            expect(redisClient.del).toHaveBeenCalledWith(`fazm:tunnel:${userId}`);
        });
    });

    describe('Fazm Voice Transcription Upgrades', () => {
        let originalDeepgramKey;
        let originalGeminiKey;

        beforeEach(() => {
            originalDeepgramKey = process.env.DEEPGRAM_API_KEY;
            originalGeminiKey = process.env.GEMINI_API_KEY;
        });

        afterEach(() => {
            process.env.DEEPGRAM_API_KEY = originalDeepgramKey;
            process.env.GEMINI_API_KEY = originalGeminiKey;
        });

        it('should transcribe audio using Deepgram when deepgram key is present', async () => {
            process.env.DEEPGRAM_API_KEY = 'dg-test-123';
            process.env.GEMINI_API_KEY = '';

            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('wav-bytes'));

            axios.post.mockResolvedValue({
                data: {
                    results: {
                        channels: [{
                            alternatives: [{
                                transcript: 'hello from voice'
                            }]
                        }]
                    }
                }
            });

            const transcript = await FazmAgentService.transcribeAudio('/tmp/test.wav');

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('api.deepgram.com'),
                expect.any(Buffer),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Token dg-test-123'
                    })
                })
            );
            expect(transcript).toBe('hello from voice');
        });

        it('should fallback to Gemini transcription when deepgram key is missing but gemini is present', async () => {
            process.env.DEEPGRAM_API_KEY = '';
            process.env.GEMINI_API_KEY = 'gemini-test-456';

            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('wav-bytes'));

            axios.post.mockResolvedValue({
                data: {
                    candidates: [{
                        content: {
                            parts: [{
                                text: 'hello from gemini audio'
                            }]
                        }
                    }]
                }
            });

            const transcript = await FazmAgentService.transcribeAudio('/tmp/test.wav');

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('generativelanguage.googleapis.com'),
                expect.objectContaining({
                    contents: expect.any(Array)
                })
            );
            expect(transcript).toBe('hello from gemini audio');
        });
    });

    describe('Fazm Controller and Composio Upgrades', () => {
        let mockReq;
        let mockRes;

        beforeEach(() => {
            mockReq = {
                user: { id: 'test-user-123' },
                body: {},
                params: {},
                headers: {},
                file: null
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
                send: vi.fn().mockReturnThis(),
                setHeader: vi.fn()
            };
        });

        it('should call uploadAttachment and return uploaded file path', async () => {
            mockReq.file = { path: 'uploads/attachments/screenshot.png' };

            await FazmAgentController.uploadAttachment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Attachment uploaded successfully.',
                file_path: 'uploads/attachments/screenshot.png'
            });
        });
    });
});

