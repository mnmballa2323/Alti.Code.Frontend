import axios from "axios";

// Helper to get base URL - normally from env
const API_URL = "http://localhost:5000/api/v1";

export interface Agent {
    _id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    price: number;
    category: string;
    capabilities: string[];
    rating: number;
    installCount: number;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}

export const AgentStoreService = {
    getAllAgents: async (filters?: { category?: string; search?: string }) => {
        try {
            const params = new URLSearchParams();
            if (filters?.category) params.append("category", filters.category);
            if (filters?.search) params.append("search", filters.search);

            const response = await axios.get(`${API_URL}/store?${params.toString()}`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching agents:", error);
            throw error;
        }
    },

    getAgentById: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/store/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching agent ${id}:`, error);
            throw error;
        }
    },

    installAgent: async (agentId: string) => {
        try {
            // Assuming headers handling or interceptors handle auth in a real app
            const response = await axios.post(`${API_URL}/store/install/${agentId}`, {});
            return response.data;
        } catch (error) {
            console.error(`Error installing agent ${agentId}:`, error);
            throw error;
        }
    }
};
