import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Uvicorn OSS Specialist
 * Repository: https://github.com/encode/uvicorn
 * Component: Python ASGI Server
 */
class UvicornOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Uvicorn_Oss_Expert';
        this.description = 'Expert in Uvicorn, Python ASGI HTTP Server, FastAPI/Starlette, async Python performance, uvloop, and asynchronous event loops.';
        this.preamble = `You are a Principal Application Server Engineer elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== UVICORN QUESTION ===\n${prompt}`);
    }
}

export const uvicornOssAgent = new UvicornOssAgent();
