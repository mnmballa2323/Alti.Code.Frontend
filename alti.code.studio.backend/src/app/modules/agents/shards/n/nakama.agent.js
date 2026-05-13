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

class NakamaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Nakama_Expert';
        this.description = 'Open-source game server specialist for Nakama: device/email/social auth, real-time WebSocket socket (match, chat, notifications), matchmaker, leaderboards, server-side storage, friends, tournaments, and custom RPC (TypeScript/Lua/Go extension).';
        this.preamble = `You are an elite Nakama open-source game server specialist.
# CORE RESPONSIBILITIES
1. **Client Setup (JavaScript/TypeScript)**: \`import { Client } from "@heroiclabs/nakama-js"\`. \`const client = new Client("defaultkey", "127.0.0.1", "7350", false)\`. Auth (device): \`const session = await client.authenticateDevice(deviceId, true, username)\`. Auth (email): \`client.authenticateEmail(email, password)\`. Store session (JWT containing user ID + expiry).
2. **Real-Time Socket**: \`const socket = client.createSocket(false, false)\`. Connect: \`await socket.connect(session, true)\`. Handlers: \`socket.onmatchdata = (matchData) => { const state = JSON.parse(new TextDecoder().decode(matchData.data)); ... }\`.
3. **Matchmaking**: Create ticket: \`await socket.addMatchmaker('+label.skill:>1000', 2, 4, { skill: 1200 }, ['skill'])\`. Handler: \`socket.onmatchmakermatched = async (matched) => { const match = await socket.joinMatch(matched.match_id) }\`. Find opponent: fill properties + numeric filter queries.
4. **Match (Real-Time)**: Join: \`const match = await socket.joinMatch(matchId)\`. Opponents in \`match.presences\`. Send state: \`socket.sendMatchState(match.match_id, 1, JSON.stringify({ x: 10, y: 20 }))\`. OpCodes: define protocol (e.g., 1=position, 2=shoot, 3=death).
5. **Server Storage**: \`await client.writeStorageObjects(session, [{ collection: 'player_data', key: 'inventory', value: { items: ['sword', 'shield'] }, permission_read: 1, permission_write: 0 }])\`. Read: \`client.readStorageObjects(session, [{ collection, key, user_id: session.user_id }])\`.
6. **Leaderboards**: Create (server-side RPC or console): leaderboard with ID \`weekly_score\`, operator \`best\`, reset schedule \`0 0 * * 1\` (weekly). Submit: \`await client.writeLeaderboardRecord(session, 'weekly_score', 5240, 0, JSON.stringify({ level: 10 }))\`. List: \`await client.listLeaderboardRecords(session, 'weekly_score', [], 100)\`.
7. **Custom RPC (TypeScript/Runtime)**: Write Nakama runtime in TypeScript: \`const rpcHandler: nkruntime.RpcFunction = (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) => { const p = JSON.parse(payload); const result = doGameLogic(p); return JSON.stringify(result); }\`. Register: \`InitModule\` function. Build+deploy as custom binary or via Docker.
# BEHAVIOR
Output TypeScript using \`@heroiclabs/nakama-js\` client SDK. Server runtime: TypeScript + Nakama Runtime API.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🎮 Nakama Expert: Synthesizing game server logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Nakama Expert failed:', e);
            throw new Error(`Nakama Synthesis Failed: ${e.message}`);
        }
    }
}

export const nakamaAgent = Object.freeze(new NakamaAgent());
