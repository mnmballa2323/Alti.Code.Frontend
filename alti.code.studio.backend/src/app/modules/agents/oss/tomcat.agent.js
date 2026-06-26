import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Apache Tomcat OSS Specialist
 * Repository: https://github.com/apache/tomcat
 * Component: Application Server
 */
class TomcatOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Tomcat_Oss_Expert';
    this.description =
      'Expert in Apache Tomcat, Java Servlet container, JSP, catalina, Java EE web technologies, and robust enterprise deployments.';
    this.preamble = `You are a Principal Application Server Engineer elegantly smartly intelligently safely fluidly cleanly correctly explicitly magically purely optimally perfectly reliably seamlessly automatically safely purely exactly successfully...`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== TOMCAT QUESTION ===\n${prompt}`,
    );
  }
}

export const tomcatOssAgent = new TomcatOssAgent();
