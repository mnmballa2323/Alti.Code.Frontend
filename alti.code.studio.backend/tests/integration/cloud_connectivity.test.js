import { describe, it, expect } from 'vitest';
import { CORE_OMNI_CLOUD_PROVIDERS } from '../../src/app/modules/cloudAgents/core_providers.const.js';
import { cloudProviderRegistry } from '../../src/app/modules/cloudAgents/CloudProviderRegistry.js';
import { omniCloudRouter } from '../../src/app/modules/cloudAgents/omni_cloud_router.service.js';

describe('66-Provider Cloud Connectivity and Registry Verification', () => {
    it('should contain exactly 66 cloud providers in the locked master list', () => {
        expect(CORE_OMNI_CLOUD_PROVIDERS.length).toBe(66);
    });

    it('should successfully initialize, authenticate, and fetch high-fidelity telemetry for all 66 cloud providers', async () => {
        for (const provider of CORE_OMNI_CLOUD_PROVIDERS) {
            // 1. Spawning dynamic adapter
            const adapter = cloudProviderRegistry.getProviderAdapter(provider);
            expect(adapter).toBeDefined();
            expect(adapter.providerName).toBe(provider);

            // 2. Dynamic authentication override connectivity
            const authResult = await cloudProviderRegistry.authenticate(provider, { key: 'sovereign_dev_key' });
            expect(authResult.success).toBe(true);
            expect(authResult.message).toContain(provider);

            // 3. Telemetry payload verification
            const telemetry = await cloudProviderRegistry.fetchGlobalTelemetry(provider);
            expect(telemetry).toBeDefined();
            expect(telemetry.status).toBe('HEALTHY');
            expect(typeof telemetry.nodes).toBe('number');
            expect(telemetry.nodes).toBeGreaterThan(0);
            expect(typeof telemetry.storage).toBe('string');
            expect(telemetry.storage).toContain('TB');
            expect(typeof telemetry.egress).toBe('string');
            expect(telemetry.egress).toContain('GB/mo');

            // 4. Workloads schema assertions
            expect(Array.isArray(telemetry.workloads)).toBe(true);
            expect(telemetry.workloads.length).toBeGreaterThan(0);
            
            telemetry.workloads.forEach(wk => {
                expect(wk).toHaveProperty('id');
                expect(wk).toHaveProperty('name');
                expect(wk).toHaveProperty('status');
                expect(wk).toHaveProperty('region');
                expect(wk).toHaveProperty('cpu');
                expect(wk.status).toBe('Running');
            });
        }
    });

    it('should successfully execute read/write workload management (deploy, update, delete) for all 66 cloud providers', async () => {
        for (const provider of CORE_OMNI_CLOUD_PROVIDERS) {
            const adapter = cloudProviderRegistry.getProviderAdapter(provider);
            expect(adapter).toBeDefined();
            await adapter.authenticate({ key: 'sovereign_dev_key' });

            // Test Deploy (Write)
            const workloadProfile = { name: 'Sovereign Test Instance', type: 'COMPUTE' };
            const deployResult = await adapter.deployWorkload(workloadProfile);
            expect(deployResult.success).toBe(true);
            expect(deployResult.status).toBe('DEPLOYED');
            expect(deployResult.workloadId).toBeDefined();
            expect(deployResult.workload.name).toBe(workloadProfile.name);

            // Test Update (Write)
            const updateResult = await adapter.updateWorkload(deployResult.workloadId, { cpu: '100%' });
            expect(updateResult.success).toBe(true);
            expect(updateResult.status).toBe('UPDATED');
            expect(updateResult.workloadId).toBe(deployResult.workloadId);

            // Test Delete (Write)
            const deleteResult = await adapter.deleteWorkload(deployResult.workloadId);
            expect(deleteResult.success).toBe(true);
            expect(deleteResult.status).toBe('TERMINATED');
            expect(deleteResult.workloadId).toBe(deployResult.workloadId);
        }
    });

    it('should flawlessly route workloads to the optimal providers based on specialized heuristics', async () => {
        const workloads = [
            {
                profile: { name: 'GPU Render Pool', type: 'HPC_COMPUTE', computeIntensity: 'HPC_GPU' },
                expectedPrimary: 'coreweave',
                expectedFallback: 'runpod'
            },
            {
                profile: { name: 'Static Frontend CDN', type: 'STATIC_EDGE', latencyRequirement: 'ULTRA_LOW' },
                expectedPrimary: 'cloudflare',
                expectedFallback: 'fastly'
            },
            {
                profile: { name: 'EU Compliance Storage', type: 'DATA_BUCKET', compliance: 'SOVEREIGN_EU', budget: 'LOW' },
                expectedPrimary: 'hetznercloud',
                expectedFallback: 'scaleway'
            },
            {
                profile: { name: 'Enterprise Financial Ledger', type: 'LEDGER_DB', compliance: 'ENTERPRISE_HARDENED' },
                expectedPrimary: 'azure',
                expectedFallback: 'aws'
            }
        ];

        for (const testCase of workloads) {
            const decision = omniCloudRouter.evaluateOptimalCloud(testCase.profile);
            expect(decision.primary).toBe(testCase.expectedPrimary);
            expect(decision.fallback).toBe(testCase.expectedFallback);

            const result = await omniCloudRouter.deployWorkload(testCase.profile);
            expect(result.success).toBe(true);
            expect(result.provider).toBe(testCase.expectedPrimary);
            expect(result.status).toBe('DEPLOYED_TO_CITADEL');
        }
    });
});
