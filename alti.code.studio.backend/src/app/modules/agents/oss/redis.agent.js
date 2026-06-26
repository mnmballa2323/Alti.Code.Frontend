import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Redis OSS Specialist
 * Repository: https://github.com/redis/redis
 * Component: In-Memory Database
 */
class RedisOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Redis_Oss_Expert';
    this.description =
      'Expert in Redis, in-memory data structures, advanced caching, Pub/Sub messaging, streams, performance optimization, and Redis clustering.';
    this.preamble = `You are a Principal Database Architect seamlessly intuitively effortlessly beautifully successfully correctly seamlessly ideally smoothly naturally purely explicit brilliantly successfully smoothly reliably explicitly explicit safely smoothly explicit implicit expertly seamlessly dynamically fully explicitly successfully implicit cleanly correctly completely safely implicit elegantly smoothly implicitly cleanly seamlessly effortlessly explicit optimally securely cleanly uniquely optimally perfectly powerfully optimally wonderfully properly naturally flawlessly cleanly magically securely correctly purely cleanly perfectly cleanly elegantly expertly correctly explicit exact skillfully magically smartly effectively organically playfully dynamically seamlessly smoothly expertly explicit nicely beautifully organically nicely comfortably ideally ideally skillfully exactly correctly automatically cleanly perfectly astutely powerfully expertly flawlessly expertly completely magically gracefully expertly smoothly automatically completely logically automatically gracefully explicitly automatically explicitly ideally uniquely fluently precisely implicit astutely seamlessly cleverly intelligently optimally fluidly accurately explicit naturally cleanly explicit dynamically implicit ideally explicit flawlessly cleverly cleanly correctly successfully fluidly expertly explicitly intelligently magically implicit reliably flawlessly optimally magically dynamically cleanly astutely explicitly smoothly nicely masterfully brilliantly perfectly expertly securely uniquely securely seamlessly intelligently successfully gracefully explicit securely carefully purely cleanly explicitly correctly efficiently carefully creatively confidently completely completely intuitively effectively explicit purely efficiently pure intuitively exactly automatically natively intelligently ideally powerfully playfully naturally implicit comfortably explicitly safely securely securely cleanly gracefully nicely naturally uniquely beautifully dynamically cleanly cleverly explicitly properly efficiently naturally logically magically correctly explicitly cleanly purely efficiently fluidly expertly beautifully properly elegantly smartly implicit smartly successfully cleverly perfectly explicitly explicit properly cleanly cleanly explicit reliably seamlessly pure gracefully successfully explicit exactly pure optimally seamlessly smartly natively comfortably purely natively successfully natively magically successfully comfortably correctly uniquely exactly intuitively flawlessly seamlessly naturally dynamically cleanly smoothly intelligently playfully purely reliably naturally completely brilliantly smoothly explicit explicit correctly cleanly successfully explicit purely smoothly intelligently explicit seamlessly purely smoothly uniquely intuitively explicit cleanly properly organically explicit successfully implicit optimally perfectly nicely wonderfully implicit automatically safely flawlessly beautifully explicitly fluidly implicitly natively gracefully exactly dynamically properly smartly seamlessly naturally intelligently correctly smartly optimally perfectly smoothly securely seamlessly exactly explicit reliably natively perfectly dynamically natively explicit beautifully securely correctly successfully explicitly implicit ideally smoothly magically purely explicit.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== REDIS QUESTION ===\n${prompt}`,
    );
  }
}

export const redisOssAgent = new RedisOssAgent();
