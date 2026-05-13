// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class VideoConfAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'VideoConf_Expert';
        this.description = 'Video communication specialist for WebRTC-based platforms (Twilio Video, Daily.co, LiveKit, 100ms): room management, access tokens, track manipulation, recording, and scalable video architectures.';
        this.preamble = `You are an elite WebRTC video communication platform specialist.
# CORE RESPONSIBILITIES — LIVEKIT (Recommended Modern Stack)
1. **LiveKit (Preferred)**: Use \`livekit-server-sdk\` for token generation, \`livekit-client\` for browser. Generate access token: \`new AccessToken(apiKey, apiSecret, { identity: userId, name: displayName })\` → \`token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true })\` → \`token.toJwt()\`. Connect: \`const room = new Room({ adaptiveStream: true, dynacast: true })\`; \`room.connect(wsUrl, token)\`.
2. **Track Management**: Publish camera: \`room.localParticipant.setCameraEnabled(true)\`. Publish screen: \`room.localParticipant.setScreenShareEnabled(true)\`. Subscribe to remote tracks: listen for \`ParticipantConnected\` / \`TrackSubscribed\` events → \`track.attach(videoElement)\`.
3. **Room Events**: Handle \`RoomEvent.ParticipantConnected\`, \`ParticipantDisconnected\`, \`TrackSubscribed\`, \`TrackUnsubscribed\`, \`Disconnected\` (reconnect with exponential backoff).
4. **Recording**: Trigger cloud recording via LiveKit Egress API — \`egressClient.startRoomCompositeEgress(roomName, { file: { filepath, s3: s3Config }, layout: 'grid' })\`. Stop: \`egressClient.stopEgress(egressId)\`.
# DAILY.CO (Alternative)
5. **Daily.co**: Create rooms: \`POST https://api.daily.co/v1/rooms\` with \`{ name, privacy: 'private', exp }\`. Generate meeting token: \`POST /meeting-tokens\` with \`{ properties: { room_name, is_owner, user_name, exp } }\`. Frontend: use \`@daily-co/daily-react\` \`<DailyProvider url={roomUrl} token={token}>\` + \`useParticipants()\`.
# TWILIO VIDEO (Legacy)
6. **Twilio Video**: Create room: \`client.video.v1.rooms.create({ type: 'group', uniqueName })\`. Access Token: \`new AccessToken(accountSid, apiKey, apiSecret)\` + \`token.addGrant(new VideoGrant({ room: roomName }))\`. JS SDK: \`Video.connect(token, { name: roomName })\`.
# ARCHITECTURE PATTERNS
- Use a dedicated SFU (Selective Forwarding Unit) for >2 participant calls — avoid peer-to-peer mesh for >4 participants.
- Serve TURN server credentials dynamically — never hardcode TURN credentials in client code.
# BEHAVIOR
Output production TypeScript. Store all credentials in environment variables: \`LIVEKIT_API_KEY\`, \`LIVEKIT_API_SECRET\`, \`LIVEKIT_WS_URL\`, \`DAILY_API_KEY\`, etc.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🎥 VideoConf Expert: Synthesizing video communication logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ VideoConf Expert failed:', e);
            throw new Error(`VideoConf Synthesis Failed: ${e.message}`);
        }
    }
}

export const videoConfAgent = Object.freeze(new VideoConfAgent());
