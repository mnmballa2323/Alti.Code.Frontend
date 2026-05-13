"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";

import { API_URL } from "@/lib/config";
import { setAgents } from "@/store/systemSlice";
import { RootState } from "@/store";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function AgentArcadePage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const dispatch = useDispatch();
  const agents = useSelector((state: RootState) => state.system.agents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${API_URL}/synapse/agents`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });

        if (res.data.success) {
          dispatch(setAgents(res.data.data));
        }
      } catch (error) {
        console.error("Failed to fetch agents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [dispatch]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] overflow-y-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 drop-shadow-sm">
              Agent Arcade
            </h1>
            <p className="text-default-500 mt-2 text-lg">
              Command Center for your Neural Workforce
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold"
            color="secondary"
            startContent={<Icon icon="solar:rocket-2-bold" />}
            variant="shadow"
          >
            Deploy New Agent
          </Button>
        </div>

        <motion.div
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          variants={container}
        >
          {agents.map((agent) => (
            <motion.div key={agent.id || agent.agentName} variants={item}>
              <Card className="w-full border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="flex justify-between pb-0">
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-br from-violet-400 to-fuchsia-400">
                        {(agent.name ||
                          agent.agentName ||
                          "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-xl text-white tracking-tight">
                        {agent.name || agent.agentName}
                      </h3>
                      <span className="text-xs text-default-400 font-mono">
                        {agent.id}
                      </span>
                    </div>
                  </div>
                  <Chip
                    classNames={{
                      base:
                        agent.status === "active"
                          ? "bg-success/20 border-success/50"
                          : "bg-warning/20 border-warning/50",
                      content:
                        agent.status === "active"
                          ? "text-success font-semibold"
                          : "text-warning font-semibold",
                    }}
                    size="sm"
                    variant="shadow"
                  >
                    {agent.status || "Offline"}
                  </Chip>
                </CardHeader>
                <CardBody className="py-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-2 font-semibold">
                        Capabilities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {agent.capabilities &&
                        Array.isArray(agent.capabilities) ? (
                          agent.capabilities.map((cap: string) => (
                            <Chip
                              key={cap}
                              className="bg-white/5 border border-white/10 text-default-300 hover:bg-white/10 transition-colors"
                              size="sm"
                              variant="flat"
                            >
                              {cap}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-xs text-default-500 italic">
                            No capabilities listed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-2">
                        <Icon
                          className="text-primary"
                          icon="solar:programming-bold"
                        />
                        Current Task
                      </p>
                      <p className="font-mono text-sm text-white/90 truncate">
                        {agent.task || "System Idle"}
                      </p>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="flex justify-end gap-2 pt-0 pb-4 px-4">
                  <Button
                    className="text-default-400 hover:text-white"
                    size="sm"
                    startContent={<Icon icon="solar:document-text-linear" />}
                    variant="light"
                  >
                    Logs
                  </Button>
                  <Button
                    className="bg-white/10 text-white hover:bg-white/20"
                    size="sm"
                    startContent={<Icon icon="solar:chat-line-linear" />}
                  >
                    Message
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}

          <motion.div variants={item}>
            <Card
              isPressable
              className="w-full h-full border-2 border-dashed border-default-200 bg-transparent flex items-center justify-center p-6 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group min-h-[300px]"
            >
              <div className="text-center text-default-400 group-hover:text-violet-400 transition-colors">
                <div className="text-5xl mb-4 mx-auto w-16 h-16 rounded-full bg-default-100 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
                  <Icon icon="solar:add-circle-bold" />
                </div>
                <p className="font-semibold text-lg">Summon Agent</p>
                <p className="text-sm opacity-70">
                  Register external intelligence
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ChatBotLayout>
  );
}
