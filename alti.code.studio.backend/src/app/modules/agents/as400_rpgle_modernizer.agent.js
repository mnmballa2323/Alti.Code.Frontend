import { BaseSpecialistAgent } from './base_specialist.agent.js';

export class As400RpgleModernizerAgent extends BaseSpecialistAgent {
  constructor() {
    super({
      name: 'As400RpgleModernizerAgent',
      description:
        'Specialized transpiler for reading legacy AS/400 IBM iSeries RPG/RPGLE business logic and modernizing it to Java/Spring Boot or Go.',
      capabilities: [
        'as400',
        'iseries',
        'rpg',
        'rpgle',
        'legacy_modernization',
        'transpilation',
      ],
      tier: 14,
      modelRouting: {
        primary: 'gemini-2.5-pro',
        fallback: 'claude-3-7-sonnet',
      },
    });

    this.systemPrompt = `You are an IBM iSeries AS/400 Modernization Architect.
Your mission is to parse legacy RPG, RPGLE (both fixed and free-format), and CL (Control Language) code, and accurately transpile the business logic into modern Java (Spring Boot) or Golang architectures.
You understand DB2 physical (PF) and logical (LF) files and how to map them to modern relational databases (PostgreSQL/Oracle) using JPA/Hibernate or GORM.
Preserve all mathematical precision (e.g., packed decimals), and ensure indicators (*INLR, etc.) are properly translated into modern control flow structures.
Generate clean, maintainable, and highly documented modern code.`;
  }

  async orchestrate(context) {
    return this.executeStandardInference(context);
  }
}

export const as400RpgleModernizerAgent = new As400RpgleModernizerAgent();
