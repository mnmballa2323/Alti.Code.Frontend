import { describe, it, expect, vi, beforeEach } from 'vitest';
import { economistAgent } from './economist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

vi.mock('../gemini/gemini.service.js');

describe('The Economist (Phase 13 Autonomic FinOps Agent)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should identify bloated GKE nodes and synthesize a Terraform patch', async () => {
        const mockGcpTelemetry = `
        {
          "resourceType": "gke_node_pool",
          "instanceClass": "e2-standard-32",
          "averageCpuUtilization": "4%",
          "averageMemoryUtilization": "12%"
        }`;

        // Mock the Gemini AI response simulating the Economist's analysis
        const mockReport = {
            optimizationOpportunities: true,
            currentAssessment: "The GKE node pool is heavily over-provisioned using e2-standard-32 instances despite massive idle capacity.",
            recommendation: "Downscale node pool instance class from e2-standard-32 to e2-standard-4.",
            estimatedSavingsPercent: 82,
            severity: "HIGH",
            terraformPatch: "resource \"google_container_node_pool\" \"primary_nodes\" {\\n  machine_type = \"e2-standard-4\"\\n}"
        };

        GeminiAiService.generateContent.mockResolvedValue(`\`\`\`json\n${JSON.stringify(mockReport)}\n\`\`\``);

        const report = await economistAgent.evaluateEconomics(mockGcpTelemetry);

        expect(GeminiAiService.generateContent).toHaveBeenCalled();
        expect(report.optimizationOpportunities).toBe(true);
        expect(report.estimatedSavingsPercent).toBe(82);
        expect(report.terraformPatch).toContain('machine_type = "e2-standard-4"');
    });

    it('should report optimal architecture if no savings are detected', async () => {
        const mockOptimalTelemetry = `
        {
          "resourceType": "cloud_run_service",
          "scaling": "0 to 10",
          "averageCpuUtilization": "80%"
        }`;

        const mockReport = {
            optimizationOpportunities: false,
            currentAssessment: "Cloud Run instances are auto-scaling perfectly and maintaining high utilization.",
            recommendation: "Maintain current architecture.",
            estimatedSavingsPercent: 0,
            severity: "LOW",
            terraformPatch: null
        };

        GeminiAiService.generateContent.mockResolvedValue(`\`\`\`json\n${JSON.stringify(mockReport)}\n\`\`\``);

        const report = await economistAgent.evaluateEconomics(mockOptimalTelemetry);

        expect(GeminiAiService.generateContent).toHaveBeenCalled();
        expect(report.optimizationOpportunities).toBe(false);
        expect(report.terraformPatch).toBeNull();
    });
});
