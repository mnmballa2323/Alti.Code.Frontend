import { describe, it, expect, afterEach } from 'vitest';
import { apiMockGeneratorService } from './api_mock_generator.service.js';
import axios from 'axios';

describe('ApiMockGeneratorService Tests', () => {
    afterEach(async () => {
        await apiMockGeneratorService.stopMockServer();
    });

    it('should launch a mock API server, serve routes, and stop cleanly', async () => {
        const port = 9182;
        const routesConfig = [
            { method: 'GET', path: '/api/v1/users', response: { users: [{ id: 1, name: 'Alice' }] } },
            { method: 'POST', path: '/api/v1/users', response: { success: true } }
        ];

        const server = await apiMockGeneratorService.startMockServer(port, routesConfig);
        expect(server.address).toBe(`http://localhost:${port}`);

        // 1. Verify GET route
        const getRes = await axios.get(`${server.address}/api/v1/users`);
        expect(getRes.status).toBe(200);
        expect(getRes.data).toEqual({ users: [{ id: 1, name: 'Alice' }] });

        // 2. Verify POST route
        const postRes = await axios.post(`${server.address}/api/v1/users`, { name: 'Bob' });
        expect(postRes.status).toBe(200);
        expect(postRes.data).toEqual({ success: true });

        // 3. Stop server
        await apiMockGeneratorService.stopMockServer();
        expect(apiMockGeneratorService.serverInstance).toBeNull();
    });
});
