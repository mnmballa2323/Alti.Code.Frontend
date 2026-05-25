import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubSweeperService } from '../../src/app/modules/githubDocs/githubSweeper.service.js';
import { githubDocsService } from '../../src/app/modules/githubDocs/githubDocs.service.js';
import EventEmitter from 'events';

describe('GitHub Swarm Phase 9: Sweeper & Live Telemetry Streaming Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        githubSweeperService.isRunning = false;
        githubSweeperService.sweepHistory = [];
        githubSweeperService.emitter.removeAllListeners();
    });

    describe('1. Continuous Autonomous Vulnerability Sweeper', () => {
        it('should successfully scan codebase, broadcast thoughts, triage patches to dependabot alerts patcher, and return compiled remediation diffs', async () => {
            const processWebhookSpy = vi.spyOn(githubDocsService, 'processSelfHealingWebhook').mockResolvedValue({
                success: true,
                triagedAgent: 'githubSecurityDependabotAlertsPatcher',
                remediationPlan: 'Upgrade lodash to 4.17.21',
                patchDiff: 'diff --git a/package.json b/package.json'
            });

            const broadcastSpy = vi.spyOn(githubSweeperService, 'broadcastThought');

            const result = await githubSweeperService.executeSecuritySweep();

            expect(result.success).toBe(true);
            expect(result.vulnerabilitiesDetected).toBe(1);
            expect(result.patchesCompiled.length).toBe(1);
            expect(result.patchesCompiled[0].package).toBe('lodash');
            expect(result.patchesCompiled[0].severity).toBe('HIGH');
            expect(result.patchesCompiled[0].patchDiff).toBe('diff --git a/package.json b/package.json');
            expect(result.patchesCompiled[0].remediationPlan).toBe('Upgrade lodash to 4.17.21');

            expect(broadcastSpy).toHaveBeenCalledWith(
                'githubSecurityDependabotAlertsPatcher',
                expect.stringContaining('Initiating global security')
            );
            expect(broadcastSpy).toHaveBeenCalledWith(
                'githubExpert',
                expect.stringContaining('Scanning package.json')
            );
            expect(broadcastSpy).toHaveBeenCalledWith(
                'githubSecurityDependabotAlertsPatcher',
                expect.stringContaining('Patch compiled successfully')
            );

            expect(processWebhookSpy).toHaveBeenCalled();
        });
    });

    describe('2. Server-Sent Events Thought Stream', () => {
        it('should properly configure EventSource response stream headers, write Initial Handshake, push broadcast thoughts, and clean listeners on close', () => {
            let headers = {};
            let flushed = false;
            let ended = false;
            let writtenData = [];

            const req = new EventEmitter();
            const res = {
                setHeader: (key, val) => { headers[key] = val; },
                flushHeaders: () => { flushed = true; },
                write: (data) => { writtenData.push(data); },
                end: () => { ended = true; }
            };

            // Start subscription stream
            githubSweeperService.subscribeThoughtStream(req, res);

            expect(headers['Content-Type']).toBe('text/event-stream');
            expect(headers['Cache-Control']).toBe('no-cache');
            expect(headers['Connection']).toBe('keep-alive');
            expect(flushed).toBe(true);

            // Verify initial connected handshake was written
            expect(writtenData[0]).toContain('"status":"connected"');

            // Broadcast a new thought event
            githubSweeperService.broadcastThought('githubActionsSpecialist', 'Compiling build task graph...');

            // Verify thought data got streamed to client
            expect(writtenData[1]).toContain('Compiling build task graph...');
            expect(writtenData[1]).toContain('"agentId":"githubActionsSpecialist"');

            // Simulate client disconnect close event
            req.emit('close');

            expect(ended).toBe(true);
            
            // Broadcast another event and check that it was NOT written because listener should be cleaned up
            githubSweeperService.broadcastThought('githubExpert', 'This should not be written.');
            expect(writtenData.length).toBe(2); // Still only 2 written blocks!
        });
    });
});
