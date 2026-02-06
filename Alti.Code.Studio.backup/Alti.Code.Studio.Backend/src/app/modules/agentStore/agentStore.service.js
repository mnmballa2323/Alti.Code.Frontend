import AgentListing from "./agentStore.model.js";

const createAgentListing = async (payload) => {
    const result = await AgentListing.create(payload);
    return result;
};

const getAllAgents = async (filters) => {
    const { category, search } = filters;
    const query = {};

    if (category && category !== "All") {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const result = await AgentListing.find(query).sort({ createdAt: -1 });
    return result;
};

const getAgentById = async (id) => {
    const result = await AgentListing.findById(id);
    return result;
};

// Mock installation for now - in future this would link to User model
const installAgent = async (userId, agentId) => {
    const agent = await AgentListing.findById(agentId);
    if (!agent) {
        throw new Error("Agent not found");
    }

    // Increment install count
    agent.installCount += 1;
    await agent.save();

    return {
        success: true,
        message: `Agent ${agent.name} installed successfully`,
        agent,
    };
};

export const AgentStoreService = {
    createAgentListing,
    getAllAgents,
    getAgentById,
    installAgent,
};
