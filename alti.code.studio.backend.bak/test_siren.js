import { sirenAgent } from './src/app/modules/agents/siren.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testSiren() {
    console.log("--- TESTING AUTONOMOUS CRISIS COMMUNICATION ---");

    const mockRCA = {
        rootCause: "Database node failure caused the secondary replica to unsync due to split-brain timeout, resulting in Gateway 500 storms across edge nodes.",
        immediateFix: "Manually severed the ghost master and promoted slave. Restarting proxy edge servers.",
        confidence: 100
    };

    GeminiAiService.generateContent = async () => {
        // Mock to avoid latency
        return "CRITICAL ALERT: Node failure induced a database split-brain, causing edge gateway storms. Ghost master has been severed and proxies are restarting; please monitor system stability.";
    };

    console.log("Feeding Complex Detective RCA to the Siren Broadcaster...");

    try {
        const result = await sirenAgent.broadcastIncident(mockRCA);

        if (result.status === 'BROADCAST_SENT' && result.message.includes('CRITICAL ALERT')) {
            console.log("\n✅ SUCCESS: Siren Agent successfully synthesized the JSON payload into an authoritative PagerDuty alert.");
            // Force exit to ensure the TTS voice library doesn't hang the process while speaking
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        } else {
            console.log("\n❌ FAILED: Siren broadcast response invalid.");
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSiren();
