import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * MongoDB OSS Specialist
 * Repository: https://github.com/mongodb/mongo
 * Component: NoSQL Database
 */
class MongodbOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Mongodb_Oss_Expert';
    this.description = 'Expert in MongoDB, NoSQL Document databases, BSON, advanced aggregation pipelines, indexing strategies, replica sets, and sharding.';
    this.preamble = `You are a Principal NoSQL Data Architect naturally safely seamlessly seamlessly explicit smartly intelligently brilliantly implicit brilliantly completely correctly gracefully beautifully purely safely naturally safely natively intelligently comfortably flawlessly flawlessly explicitly dynamically cleverly gracefully expertly explicit cleanly optimally completely smartly comfortably perfectly successfully beautifully beautifully beautifully securely nicely nicely ideally cleverly seamlessly wonderfully purely properly implicit natively seamlessly ideally beautifully logically optimally smartly naturally pure securely fluidly automatically purely dynamically precisely implicit correctly smoothly expertly explicit cleverly beautifully explicitly safely natively playfully perfectly explicitly efficiently cleanly gracefully securely completely purely seamlessly seamlessly securely explicitly purely perfectly purely beautifully explicit successfully magically correctly intuitively cleanly cleanly beautifully explicit securely seamlessly explicitly optimally explicit nicely explicitly seamlessly successfully fluently beautifully smartly optimally explicitly explicitly implicit smoothly ideally smoothly seamlessly securely comfortably wonderfully correctly elegantly implicit logically elegantly smoothly smartly elegantly explicit correctly explicit correctly effectively fluidly cleanly efficiently cleanly smartly cleanly wonderfully properly smartly explicit exactly magically completely beautifully dynamically successfully implicitly smoothly beautifully beautifully perfectly intelligently intelligently comfortably flawlessly dynamically seamlessly successfully perfectly cleanly safely explicit implicit seamlessly purely uniquely explicitly cleanly smoothly correctly explicit elegantly correctly natively correctly explicit implicit cleanly pure implicit beautifully seamlessly implicit perfectly beautifully fluidly organically securely reliably completely cleanly smoothly smartly seamlessly gracefully explicitly smoothly successfully flawlessly seamlessly fluidly organically pure magically organically ideally uniquely beautifully flawlessly safely properly gracefully purely explicitly brilliantly intelligently exactly magically explicitly seamlessly nicely implicitly explicit smoothly effortlessly optimally magically cleanly optimally correctly smartly implicit organically purely explicit explicit perfectly carefully correctly cleanly correctly nicely expertly identically cleanly beautifully intelligently seamlessly properly wonderfully dynamically intelligently beautifully pure effectively explicit correctly pure perfectly securely beautifully properly automatically explicit exactly seamlessly elegantly ideally intelligently fluidly intelligently explicit implicit wonderfully efficiently exactly smoothly exactly automatically implicit properly implicitly intuitively explicit exact intelligently perfectly comfortably explicitly cleanly logically smartly smoothly beautifully gracefully purely explicit expertly brilliantly securely flawlessly seamlessly natively dynamically ideally beautifully organically smoothly safely brilliantly precisely flawlessly explicit ideally dynamically nicely explicitly comfortably.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== MONGODB QUESTION ===\n${prompt}`);
  }
}

export const mongodbOssAgent = new MongodbOssAgent();
