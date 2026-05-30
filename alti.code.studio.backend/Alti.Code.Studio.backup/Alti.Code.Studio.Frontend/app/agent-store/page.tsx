"use client";

import React, { useEffect, useState } from "react";
import { Input, Button, Spacer, Tab, Tabs } from "@heroui/react";
import { AgentStoreService, Agent } from "../../services/agentStore.service";
import { AgentCard } from "../../components/agent-store/AgentCard";
import { toast } from "react-hot-toast";

// Mock data for initial render until backend is fully populated
const MOCK_AGENTS: Agent[] = [
    {
        _id: "1",
        name: "Trial Prep Assistant",
        description: "Organizes exhibit lists and drafts witness questions.",
        version: "1.0.0",
        author: "Chamber.Law",
        price: 0,
        category: "Legal",
        capabilities: ["Document Analysis", "Drafting"],
        rating: 4.8,
        installCount: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "2",
        name: "Research Deep Diver",
        description: "Scours specialized databases for case law precedents.",
        version: "2.1.0",
        author: "Alti AI",
        price: 29.99,
        category: "Research",
        capabilities: ["Web Search", "Summarization"],
        rating: 4.9,
        installCount: 850,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "3",
        name: "Scheduler Bot",
        description: "Automates meeting coordination with clients.",
        version: "1.0.5",
        author: "Productivity Inc",
        price: 0,
        category: "Productivity",
        capabilities: ["Calendar", "Email"],
        rating: 4.2,
        installCount: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function AgentStorePage() {
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [loading, setLoading] = useState(false); // Set to true when real fetching enabled
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Legal", "Productivity", "Research", "Coding", "Utility"];

    const fetchAgents = async () => {
        // In a real scenario, uncomment this:
        /*
        setLoading(true);
        try {
            const data = await AgentStoreService.getAllAgents({ 
                search: searchQuery, 
                category: selectedCategory 
             });
            setAgents(data);
        } catch (err) {
            toast.error("Failed to load agents");
        } finally {
            setLoading(false);
        }
        */
    };

    useEffect(() => {
        fetchAgents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]); // Debounce search in real app

    const handleSearch = () => {
        fetchAgents();
    }

    const handleInstall = async (agent: Agent) => {
        setInstallingId(agent._id);
        try {
            // await AgentStoreService.installAgent(agent._id);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Successfully installed ${agent.name}`);
        } catch (error) {
            toast.error("Installation failed");
        } finally {
            setInstallingId(null);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl px-6 flex-grow pt-10">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">Agent Store</h1>
                    <p className="text-default-500 text-lg">Discover specialized AI agents to supercharge your workflow.</p>
                </div>

                <Spacer y={4} />

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10 bg-background/70 backdrop-blur-md py-4">
                    <Tabs
                        aria-label="Categories"
                        color="primary"
                        variant="underlined"
                        selectedKey={selectedCategory}
                        onSelectionChange={(key) => setSelectedCategory(key as string)}
                    >
                        {categories.map(cat => (
                            <Tab key={cat} title={cat} />
                        ))}
                    </Tabs>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Input
                            placeholder="Search agents..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            startContent={<span className="text-default-400">🔍</span>}
                            classNames={{
                                inputWrapper: "bg-default-100",
                            }}
                        />
                        <Button color="primary" onPress={handleSearch}>Search</Button>
                    </div>
                </div>

                <Spacer y={4} />

                {loading ? (
                    <div className="flex justify-center p-10"><span className="loading">Loading...</span></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {agents
                            .filter(a => selectedCategory === "All" || a.category === selectedCategory)
                            .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((agent) => (
                                <AgentCard
                                    key={agent._id}
                                    agent={agent}
                                    onInstall={handleInstall}
                                    isInstalling={installingId === agent._id}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
