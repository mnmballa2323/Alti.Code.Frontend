class DynamicAgentFactory {
    /**
     * Forge an agent capability dynamically in memory based on requested capability name.
     * @param {string} capability - The specialized capability (e.g., Salesforce_IntegrationEngineer)
     * @returns {Object} - Agent definition schema
     */
    static createAgent(capability) {
        const timestamp = Date.now();
        const id = `dynamic_agent_${timestamp}`;
        
        return {
            name: id,
            title: `Specialist ${capability} Agent`,
            description: `Bespoke dynamic specialist agent forged on the fly to handle missing capability: ${capability}`,
            preamble: `You are a dynamic specialist agent specializing in ${capability}.`,
            keywords: [
                capability.toLowerCase(),
                id
            ]
        };
    }
}

module.exports = DynamicAgentFactory;
