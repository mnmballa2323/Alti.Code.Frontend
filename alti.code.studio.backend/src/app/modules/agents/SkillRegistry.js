const skillScanner = require('../security/SkillScanner');

/**
 * Unified Swarm Skill Registry
 * Centralized mapping of tools from Anthropic, Microsoft, AWS, Google, and independent repos.
 * Normalizes different tool formats into a single Model Context Protocol (MCP) compatible schema.
 */
class SkillRegistry {
  constructor() {
    this.skills = new Map();
    this.namespaces = new Set();
  }

  /**
   * Registers a new external skill after zero-trust validation.
   * @param {string} namespace (e.g., 'aws', 'claude', 'google')
   * @param {object} skillDefinition The raw skill functions
   * @param {string} sourcePath Path to the skill code for auditing
   */
  async registerSkill(namespace, skillDefinition, sourcePath) {
    // 1. Auditor Validation Pipeline
    const scanResult = await skillScanner.scanSkill(sourcePath);
    if (!scanResult.isSafe) {
      throw new Error(
        `[SkillRegistry] Validation failed for ${namespace}. Malicious intent detected.`,
      );
    }

    // 2. Normalize and Register
    console.log(
      `[SkillRegistry] Registering validated skill namespace: ${namespace}`,
    );
    this.namespaces.add(namespace);

    for (const [toolName, toolFunction] of Object.entries(skillDefinition)) {
      const fqn = `${namespace}::${toolName}`; // Fully Qualified Name
      this.skills.set(fqn, this._normalizeMCP(toolName, toolFunction));
    }

    console.log(
      `[SkillRegistry] Active namespaces: ${Array.from(this.namespaces).join(', ')}`,
    );
    return true;
  }

  /**
   * Retrieves a tool ready for Gemini / Swarm execution.
   */
  getTool(fqn) {
    if (!this.skills.has(fqn)) {
      throw new Error(`[SkillRegistry] Tool ${fqn} not found.`);
    }
    return this.skills.get(fqn);
  }

  /**
   * Normalizes a function into Model Context Protocol / OpenAI Function format.
   */
  _normalizeMCP(name, func) {
    // Abstracting the JSON schema generation for the LLM
    return {
      name,
      description: func.description || 'External agentic skill',
      execute: async args => {
        return await func.execute(args);
      },
    };
  }
}

module.exports = new SkillRegistry();
