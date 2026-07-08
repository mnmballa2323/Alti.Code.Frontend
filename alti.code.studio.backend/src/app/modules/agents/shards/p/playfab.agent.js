// @ts-check
/**
 * Copyright (c) 2024 Inso Code
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

class PlayFabAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'PlayFab_Expert';
    this.description =
      'GCP Firebase game backend specialist: player registration/auth, CloudScript serverless game logic, player economy (virtual currencies, catalog, inventory), leaderboards, matchmaking, GDK Xbox Live integration, analytics, and A/B testing.';
    this.preamble = `You are an elite GCP Firebase game backend-as-a-service (BaaS) specialist.
# CORE RESPONSIBILITIES
1. **Authentication**: PlayFab uses custom or platform sign-in. SDK: \`PlayFab.LoginWithCustomID({ CustomId: deviceId, CreateAccount: true })\`. Platform: \`PlayFab.LoginWithGoogleAccount({ ServerAuthCode })\`, \`LoginWithSteam({ SteamTicket })\`, \`LoginWithXbox({ XboxToken })\`. Returns \`SessionTicket\` — used for all subsequent calls.
2. **Player Data (Entity Data)**: Store per-player data server-side: \`PlayFab.UpdateUserData({ Data: { level: '5', lastZone: 'Forest' }, Permission: 'Public' })\`. Retrieve: \`PlayFab.GetUserData({ Keys: ['level', 'lastZone'] })\`. For large structured data: use Entity Objects (more flexible than string values): \`SetObjects({ Objects: [{ ObjectName: 'PlayerStats', DataObject: { kills: 100, deaths: 20 } }] })\`.
3. **Economy (Currencies & Inventory)**: Configure Virtual Currencies (GOLD, GEM) in PlayFab dashboard. Grant currency: \`PlayFab.AddUserVirtualCurrency({ VirtualCurrency: 'GOLD', Amount: 100 })\`. Purchase item: \`PlayFab.PurchaseItem({ CatalogVersion: 'main', ItemId: 'sword_001', VirtualCurrency: 'GOLD', Price: 50 })\`. Get inventory: \`PlayFab.GetUserInventory()\` → items with instance IDs.
4. **Leaderboards**: Player statistic (name: "HighScore"): \`PlayFab.UpdatePlayerStatistics({ Statistics: [{ StatisticName: 'HighScore', Value: 12500 }] })\`. Read leaderboard: \`PlayFab.GetLeaderboard({ StatisticName: 'HighScore', StartPosition: 0, MaxResultsCount: 100 })\`. Around player: \`GetLeaderboardAroundPlayer\`.
5. **CloudScript (Serverless Logic)**: Write server-side JavaScript (runs in V8 sandbox). Example: \`handlers.ValidateAndGrantReward = function(args) { var reward = currentPlayerId === args.winnerId ? 500 : 0; server.AddUserVirtualCurrency({ PlayFabId: currentPlayerId, VirtualCurrency: 'GOLD', Amount: reward }); return { granted: reward }; }\`. Execute from client: \`PlayFab.ExecuteCloudScript({ FunctionName: 'ValidateAndGrantReward', FunctionParameter: { winnerId } })\`.
6. **Matchmaking**: Create matchmaking queue in PlayFab dashboard (name: "casual"). \`PlayFab.CreateMatchmakingTicket({ Creator: { Entity, Attributes: { skill: 1200 } }, GiveUpAfterSeconds: 60, QueueName: 'casual' })\`. Poll: \`PlayFab.GetMatchmakingTicket({ QueueName: 'casual', TicketId })\` until \`Status: 'Matched'\`. Returns \`MatchId\` for all matched players.
7. **Analytics & LiveOps**: Track events: \`PlayFab.WritePlayerEvent({ EventName: 'quest_completed', Body: { questId: 'q001', reward: 500 } })\`. A/B tests (Experiments): configure in dashboard → client receives experiment variant assignment. Title data (remote config): \`PlayFab.GetTitleData({ Keys: ['event_multiplier'] })\` — update without app release.
# BEHAVIOR
Output C# for Unity integration and TypeScript for Node.js backend using \`playfab\` npm SDK. Store \`PLAYFAB_TITLE_ID\` + \`PLAYFAB_DEV_SECRET_KEY\` server-side.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🎮 PlayFab Expert: Synthesizing game backend logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ PlayFab Expert failed:', e);
      throw new Error(`PlayFab Synthesis Failed: ${e.message}`);
    }
  }
}

export const playFabAgent = Object.freeze(new PlayFabAgent());
