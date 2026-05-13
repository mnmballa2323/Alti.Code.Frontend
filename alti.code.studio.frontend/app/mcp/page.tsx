"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { AlertWrapper } from "@/components/ui/AlertWrapper";
import { API_URL } from "@/lib/config";

type Tool = {
  name: string;
  description: string;
  inputSchema?: any;
};

export default function McpDashboard() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Pillar 9 Additions
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newMcpUrl, setNewMcpUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/mcp/tools/local`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.data.success) {
        setTools(res.data.data);
      } else {
        setError("Failed to fetch tools.");
      }
    } catch (err) {
      setError(
        "Backend is unreachable. Ensure the server is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnectMcp = async (onClose: () => void) => {
    setIsConnecting(true);
    try {
      await axios.post(
        `${API_URL}/mcp/connect`,
        { url: newMcpUrl },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
      fetchTools();
      onClose();
      setNewMcpUrl("");
    } catch (err) {
      setError("Failed to connect external MCP server.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-default-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Nervous System
          </h1>
          <p className="text-gray-500 mt-1">
            Model Context Protocol (MCP) Registry
          </p>
        </div>
        <Chip className="border-success" color="success" variant="dot">
          System Online
        </Chip>
      </div>

      {error && (
        <AlertWrapper className="mb-4" variant="danger">
          <div className="flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" />
            <span>{error}</span>
            <Button size="sm" variant="flat" onPress={fetchTools}>
              Retry
            </Button>
          </div>
        </AlertWrapper>
      )}

      <div className="flex justify-between gap-4 mb-6">
        <div className="flex gap-4 w-full">
          <Input
            className="max-w-md"
            placeholder="Search tools..."
            startContent={<Icon icon="solar:magnifer-linear" />}
            value={search}
            onValueChange={setSearch}
          />
          <Button
            color="primary"
            startContent={<Icon icon="solar:refresh-linear" />}
            variant="flat"
            onPress={fetchTools}
          >
            Refresh
          </Button>
        </div>
        <Button
          color="secondary"
          startContent={<Icon icon="solar:plug-circle-bold" />}
          variant="shadow"
          onPress={onOpen}
        >
          Add Custom MCP
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner label="Connecting to Cortex..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <Card
              key={tool.name}
              className="hover:scale-[1.02] transition-transform"
            >
              <CardHeader className="flex gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Icon icon="solar:code-square-bold" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">{tool.name}</p>
                  <p className="text-small text-default-500 capitalize">
                    {tool.name.split("_").join(" ")}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 min-h-[40px]">
                  {tool.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {tool.inputSchema?.required?.map((req: string) => (
                    <Chip key={req} color="danger" size="sm" variant="flat">
                      {req}*
                    </Chip>
                  ))}
                  {Object.keys(tool.inputSchema?.properties || {})
                    .filter(
                      (p: string) => !tool.inputSchema?.required?.includes(p),
                    )
                    .map((prop: string) => (
                      <Chip key={prop} size="sm" variant="flat">
                        {prop}
                      </Chip>
                    ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pillar 9: Custom Swarm MCP Dialog */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Evolve The Swarm
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-gray-500 mb-4">
                  Provide an SSE or Stdio endpoint for a custom Model Context
                  Protocol (MCP) server. The Swarm Orchestrator will instantly
                  learn these tools and dynamically route intents to them.
                </p>
                <Input
                  autoFocus
                  label="MCP Server URL"
                  placeholder="http://localhost:8080/sse"
                  value={newMcpUrl}
                  variant="bordered"
                  onValueChange={setNewMcpUrl}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isConnecting}
                  onPress={() => handleConnectMcp(onClose)}
                >
                  Inject Protocol
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
