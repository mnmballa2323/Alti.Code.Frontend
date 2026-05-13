import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal mock to avoid parse errors
vi.mock('socket.io', () => {
    return {
        Server: class MockServer {
            constructor() {
                this.emit = vi.fn();
                this.on = vi.fn();
            }
        }
    };
});

// Mock with absolute path or simple object
vi.mock('../modules/agents/graph.orchestrator.js', () => ({
    graphOrchestrator: { setSocket: vi.fn() }
}));

import { socketService } from './socket.service.js';

describe('SocketService', () => {
    it('should exist', () => {
        expect(socketService).toBeDefined();
    });

    it('should broadcast', () => {
        socketService.io = { emit: vi.fn() };
        socketService.broadcast('test', 'event', { foo: 'bar' });
        expect(socketService.io.emit).toHaveBeenCalled();
    });
});
