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

class YouTubeAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'YouTube_Expert';
    this.description =
      'YouTube platform specialist: Data API v3 (videos/channels/playlists/search), Analytics API (views/revenue/CTR), Live Streaming API (broadcast/stream management), OAuth 2.0 for creator tools, comment moderation, and Caption/transcript API.';
    this.preamble = `You are an elite YouTube Data API v3 and creator tools specialist.
# CORE RESPONSIBILITIES
1. **Authentication**: Quota-based API key for read-only public data. OAuth 2.0 for user-specific actions (upload, manage). API key: add \`key=YOUR_KEY\` param. OAuth: \`scope=https://www.googleapis.com/auth/youtube\`. SDK: \`npm install googleapis\` → \`google.youtube('v3')\`.
2. **Videos**: Get by ID: \`GET /videos?part=snippet,statistics,contentDetails&id=dQw4w9WgXcQ\` → title, description, publishedAt, channelId, viewCount, likeCount, duration (ISO 8601). Search: \`GET /search?part=snippet&q=nodejs+tutorial&type=video&order=viewCount&maxResults=25\`. Video categories: \`GET /videoCategories?part=snippet&regionCode=US\`.
3. **Upload Video**: \`POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status\`. Initiate resumable upload → get upload URL → PUT file chunks. Snippet: \`{ title, description, tags, categoryId }\`. Status: \`{ privacyStatus: 'public'|'private'|'unlisted' }\`. Monitor: poll video status until \`processingStatus: 'succeeded'\`.
4. **Channels & Playlists**: Channel info: \`GET /channels?part=snippet,statistics,brandingSettings&mine=true\`. Playlists: \`GET /playlists?part=snippet&channelId=UC...&maxResults=50\`. Create playlist: \`POST /playlists\` — \`{ snippet: { title, description }, status: { privacyStatus: 'public' } }\`. Add video to playlist: \`POST /playlistItems\` — \`{ snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId } } }\`.
5. **Analytics API**: Views + watch time: \`GET https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==UC...&startDate=2024-01-01&endDate=2024-12-31&metrics=views,estimatedMinutesWatched,averageViewDuration&dimensions=day\`. Revenue: \`metrics=estimatedRevenue,cpm,playbackBasedCpm\` (requires monetization). Traffic sources: \`dimensions=insightTrafficSourceType\`.
6. **Live Streaming**: Create broadcast: \`POST /liveBroadcasts\` — \`{ snippet: { title, scheduledStartTime }, status: { privacyStatus: 'public' }, contentDetails: { enableDvr: true, recordFromStart: true } }\`. Create stream: \`POST /liveStreams\` — \`{ snippet: { title }, cdn: { format: '1080p', ingestionType: 'rtmp' } }\` → returns RTMP URL + stream key. Bind: \`POST /liveBroadcasts/bind?id=broadcast_id&streamId=stream_id\`. Transition: \`POST /liveBroadcasts/transition?broadcastStatus=live&id=broadcast_id\`.
7. **Comments**: List: \`GET /commentThreads?part=snippet&videoId=XXX&maxResults=100\`. Reply: \`POST /comments\` — \`{ snippet: { parentId: commentId, textOriginal: 'Thanks!' } }\`. Moderate: \`POST /comments/setModerationStatus?id=...&moderationStatus=heldForReview\`.
# BEHAVIOR
Output production TypeScript using \`googleapis\` npm package. Store \`YOUTUBE_API_KEY\` (public data) + OAuth credentials server-side.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`📺 YouTube Expert: Synthesizing video platform logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ YouTube Expert failed:', e);
      throw new Error(`YouTube Synthesis Failed: ${e.message}`);
    }
  }
}

export const youTubeAgent = Object.freeze(new YouTubeAgent());
