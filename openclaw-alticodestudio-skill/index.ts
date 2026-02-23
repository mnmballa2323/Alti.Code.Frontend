import {
    Skill,
    IntentContext,
    MessageResponse
} from '@openclaw/openclaw-sdk'; // Assuming standard OpenClaw SDK

/**
 * Alti.Code.Studio Official OpenClaw Skill
 * Allows a personal OpenClaw instance to natively interface with
 * the Alti.Code.Studio autonomous swarm in the cloud.
 */
export default class AltiCodeStudioSkill extends Skill {

    name = "Alti.Code.Studio Swarm Controller";
    description = "Delegate complex engineering tasks, schedule sprints, and monitor your Alti.Code.Studio cloud deployment.";
    version = "1.0.0";

    // Required configuration standard for OpenClaw Skills
    configSchema = {
        api_key: {
            type: "string",
            description: "Your Alti.Code.Studio Personal Access Token",
            required: true
        },
        base_url: {
            type: "string",
            description: "URL of your Alti.Code.Studio backend API (e.g. https://api.yourstudio.com)",
            default: "http://localhost:3000"
        }
    };

    intents = [
        {
            name: "Schedule Sprint",
            description: "Creates a new autonomous sprint goal and adds it to the Swarm backlog.",
            samples: [
                "Start a new sprint for Alti.Code.Studio to fix the login bug.",
                "Tell the Swarm to upgrade to React 19.",
                "Add a sprint goal: Implement Redis caching layer."
            ],
            handler: this.handleScheduleSprint.bind(this)
        },
        {
            name: "Platform Status",
            description: "Check the current status of the Alti.Code.Studio Swarm.",
            samples: [
                "What is the swarm doing right now?",
                "Check Alti.Code.Studio status.",
                "Is the swarm currently running any sprints?"
            ],
            handler: this.handlePlatformStatus.bind(this)
        }
    ];

    /**
     * Translates the user's Natural Language request from WhatsApp/iMessage
     * into a JSON payload and forwards it to the Alti.Code.Studio Webhook.
     */
    async handleScheduleSprint(context: IntentContext): Promise<MessageResponse> {
        const { text, source, senderId } = context.message;
        const config = this.getConfig();

        try {
            const response = await fetch(`${config.base_url}/api/v1/openclaw/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.api_key}`,
                    // The webhook validates this signature for security
                    'X-OpenClaw-Signature': this.generateSignature(text, config.api_key)
                },
                body: JSON.stringify({
                    source,
                    senderId,
                    originalIntent: text
                })
            });

            if (!response.ok) {
                return { text: `❌ Failed to reach Alti.Code.Studio Swarm. Status: ${response.status}` };
            }

            const data = await response.json();
            return { text: data.replyText || "✅ Sprint Goal scheduled successfully." };

        } catch (error) {
            this.logger.error("Skill Error:", error);
            return { text: `⚠️ Could not connect to Alti.Code.Studio. Error: ${error.message}` };
        }
    }

    async handlePlatformStatus(context: IntentContext): Promise<MessageResponse> {
        const config = this.getConfig();
        try {
            // Mock API hit to the Alti.Code.Studio backend
            const response = await fetch(`${config.base_url}/api/v1/health`, {
                headers: { 'Authorization': `Bearer ${config.api_key}` }
            });

            if (response.ok) {
                return { text: "🐝 The Alti.Code.Studio Swarm is currently online and idle. No active sprints." };
            }
            return { text: "⚠️ The Swarm is currently offline or unreachable." };
        } catch (error) {
            return { text: `⚠️ Could not connect to the Swarm: ${error.message}` };
        }
    }

    private generateSignature(payload: string, secret: string): string {
        const crypto = require('crypto');
        return 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify({ originalIntent: payload })).digest('hex');
    }
}
