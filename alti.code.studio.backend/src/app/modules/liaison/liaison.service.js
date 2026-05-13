import { liaisonAgent } from './liaison.agent.js';

const handleWebhook = async (source, payload) => {
    return await liaisonAgent.handleWebhook(source, payload);
};

export const LiaisonService = {
    handleWebhook
};
