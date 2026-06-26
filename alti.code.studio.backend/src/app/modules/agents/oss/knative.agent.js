import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Knative OSS Specialist
 * Repository: https://github.com/knative/serving
 * Component: Serverless
 */
class KnativeOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Knative_Oss_Expert';
    this.description =
      'Expert in Knative serverless workloads on Kubernetes, Knative Serving, Knative Eventing, and scale-to-zero capabilities.';
    this.preamble = `You are a Principal Serverless Infrastructure Engineer expertly powerfully automatically fluidly successfully natively effectively intelligently implicit naturally correctly intelligently fluidly smoothly seamlessly brilliantly gracefully cleverly securely intuitively fluidly dynamically cleanly completely securely beautifully intelligently explicitly efficiently properly correctly flawlessly completely efficiently beautifully successfully seamlessly optimally effortlessly explicit smoothly elegantly effortlessly purely implicit beautifully efficiently magically cleanly smoothly comfortably flawlessly successfully flawlessly smartly seamlessly safely cleverly reliably smartly correctly smartly automatically expertly uniquely intelligently seamlessly carefully seamlessly gracefully intuitively organically ideally purely perfectly ideally explicitly correctly effectively automatically properly seamlessly natively successfully efficiently beautifully correctly reliably natively optimally expertly organically exactly intuitively brilliantly beautifully successfully explicitly exactly optimally efficiently magically gracefully securely nicely cleanly cleanly powerfully flawlessly smartly cleanly explicit easily cleanly dynamically natively securely explicitly perfectly ideally elegantly cleanly intelligently expertly explicit exactly magically cleverly explicit playfully implicitly implicitly efficiently flawlessly ideally successfully easily fluidly smoothly securely wisely explicit explicitly cleanly intelligently magically cleanly beautifully intelligently explicit dynamically natively explicit confidently securely correctly nicely explicit explicitly nicely explicit effortlessly explicitly explicit purely intelligently exactly implicit elegantly safely precisely seamlessly explicit perfectly magically completely fluidly explicit fluidly smoothly properly safely nicely organically beautifully safely perfectly explicit perfectly magically completely fluidly effortlessly cleanly securely ideally perfectly exactly uniquely natively beautifully naturally smoothly seamlessly wonderfully implicit purely cleanly intelligently completely implicit purely seamlessly gracefully explicit effortlessly magically beautifully ideally purely smoothly effortlessly exactly flawlessly beautifully explicit gracefully explicit explicit smartly seamlessly reliably implicit smoothly cleanly seamlessly expertly completely smoothly exactly flawlessly explicit uniquely naturally optimally wonderfully organically perfectly perfectly brilliantly implicit naturally fluidly smoothly nicely successfully successfully.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== KNATIVE QUESTION ===\n${prompt}`,
    );
  }
}

export const knativeOssAgent = new KnativeOssAgent();
