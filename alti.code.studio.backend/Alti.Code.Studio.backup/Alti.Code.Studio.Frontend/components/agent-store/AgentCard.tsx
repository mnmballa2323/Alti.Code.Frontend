"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Image } from "@heroui/react";
import { Agent } from "../../services/agentStore.service";

interface AgentCardProps {
    agent: Agent;
    onInstall: (agent: Agent) => void;
    isInstalling?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onInstall, isInstalling = false }) => {
    return (
        <Card className="py-4">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex justify-between w-full items-start">
                    <div>
                        <p className="text-tiny uppercase font-bold text-default-500">{agent.category}</p>
                        <small className="text-default-500">{agent.installCount} Installs</small>
                    </div>
                    <Chip color="warning" variant="flat" size="sm">★ {agent.rating.toFixed(1)}</Chip>
                </div>
                <h4 className="font-bold text-large mt-2">{agent.name}</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
                <div className="flex gap-4">
                    {/* Placeholder for icon if none provided */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl">
                        {agent.icon ? (
                            <Image
                                alt={agent.name}
                                className="object-cover rounded-xl"
                                src={agent.icon}
                                width={64}
                            />
                        ) : (
                            agent.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <p className="text-small text-default-500 line-clamp-3">{agent.description}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                    {agent.capabilities.slice(0, 3).map((cap, i) => (
                        <Chip key={i} size="sm" variant="dot" color="primary">{cap}</Chip>
                    ))}
                </div>
            </CardBody>
            <CardFooter className="justify-between items-center">
                <div className="text-small font-semibold">
                    {agent.price === 0 ? "Free" : `$${agent.price.toFixed(2)}`}
                </div>
                <Button
                    className="font-bold"
                    color="primary"
                    radius="full"
                    size="sm"
                    variant={agent.price === 0 ? "solid" : "ghost"}
                    onPress={() => onInstall(agent)}
                    isLoading={isInstalling}
                >
                    {agent.price === 0 ? "Install" : "Buy"}
                </Button>
            </CardFooter>
        </Card>
    );
};
