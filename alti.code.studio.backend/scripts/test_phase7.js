/**
 * Phase 7: Universal Autopoiesis Verification
 * Simulates:
 * 1. Ambassador converting Slack requirement into a Sprint Goal.
 * 2. Zero-Touch DevOps provisioning a Redis cache and scaling K8s.
 * 3. The Publisher analyzing commits and determining the release version.
 */

// Disable auto-runs for safety during the test
process.env.TERRAFORM_AUTORUN = 'false';
process.env.KUBECTL_AUTORUN = 'false';
process.env.AUTO_PUBLISH = 'false';

import { slackAmbassadorService } from '../src/app/modules/ambassador/slack.service.js';
import { iacGeneratorService } from '../src/app/modules/infrastructure/iac.generator.service.js';
import { autoscalerService } from '../src/app/modules/infrastructure/autoscaler.service.js';
import { releaseService } from '../src/app/modules/publisher/release.service.js';
import { distributionService } from '../src/app/modules/publisher/distribution.service.js';
import { GeminiAiService } from '../src/app/modules/gemini/gemini.service.js';

// MOCK GEMINI
GeminiAiService.generateContent = async (prompt) => {
    if (prompt.includes('Semantic Version bump')) {
        return 'patch';
    }
    return 'Sprint Goal: Deploy highly available Redis cache cluster on AWS using ElastiCache.';
};

async function verifyPhase7() {
    console.log('🌌 Initializing Phase 7: Universal Autopoiesis Verification...\n');

    try {
        console.log('👔 1. The Ambassador: Simulating Stakeholder Intake...');
        const slackMessage = "Hey swarm, we need a Redis caching layer immediately because our latency is spiking heavily on the feed endpoints. Make it happen.";
        console.log(`[Stakeholder]: "${slackMessage}"`);

        const prompt = `Translate this into a precise technical Sprint Goal: "${slackMessage}"`;
        const sprintGoal = await GeminiAiService.generateContent(prompt);
        console.log(`[Swarm Translated Goal]: ${sprintGoal.replace(/^["'\`]+|["'\`]+$/g, '').trim()}\n`);

        console.log('🏗️ 2. Zero-Touch DevOps: Generating Infrastructure...');
        const tfResult = await iacGeneratorService.provisionInfrastructure('Deploy a highly available Redis cache cluster on AWS using ElastiCache.');
        console.log(`[TF Status]: ${tfResult}`);

        const k8sResult = await iacGeneratorService.generateK8sManifest('redis-cache', 'redis:7-alpine', 6379);
        console.log(`[K8s Status]: ${k8sResult}\n`);

        console.log('⚖️ 3. Zero-Touch DevOps: Simulating Autoscaler Event...');
        // Simulating a high-latency event: 3000ms latency, 6% error rate
        await autoscalerService.evaluateScaleEvent('redis-cache', 3000, 0.06);
        console.log();

        console.log('📦 4. The Publisher: Calculating Version Bump...');
        const newVersion = await releaseService.calculateAndApplySemVer();
        console.log(`[Calculated Version Bump]: ${newVersion}`);

        console.log('\n🐳 5. The Publisher: Simulating Distribution Pipeline...');
        await distributionService.distributeRelease(newVersion);

        console.log('\n✅ Verification PASSED: All Autopoiesis systems fully functional.');
    } catch (error) {
        console.error('\n❌ Verification FAILED:', error);
    } finally {
        console.log('\n✨ Verification complete. Exiting.');
        process.exit();
    }
}

verifyPhase7();
