"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Input, Textarea } from "@heroui/react";
import { BookOpen, Globe, Eye, EyeOff, Shield } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addDocument, updateDocument } from "@/store/systemSlice";

export default function Documents() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();

  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocApiKey, setNewDocApiKey] = useState("");
  const [newDocInstructions, setNewDocInstructions] = useState("");
  const [newDocGuardrails, setNewDocGuardrails] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveDocId(null);
      setNewDocName("");
      setNewDocUrl("");
      setNewDocApiKey("");
      setNewDocInstructions("");
      setNewDocGuardrails("");
    };

    const handleEditDocument = (e: any) => {
      const doc = e.detail;

      setActiveDocId(doc.id);
      setNewDocName(doc.name);
      setNewDocUrl(doc.url);
      setNewDocApiKey(doc.apiKey || "");
      setNewDocInstructions(doc.customInstructions || "");
      setNewDocGuardrails(doc.guardrails || "");
    };

    window.addEventListener("open-document-modal", handleOpenPanel);
    window.addEventListener("edit-document", handleEditDocument);

    return () => {
      window.removeEventListener("open-document-modal", handleOpenPanel);
      window.removeEventListener("edit-document", handleEditDocument);
    };
  }, [dispatch]);

  const handleSaveDocument = () => {
    if (!newDocUrl || !newDocName) return;

    if (activeDocId) {
      dispatch(
        updateDocument({
          id: activeDocId,
          url: newDocUrl,
          name: newDocName,
          apiKey: newDocApiKey,
          customInstructions: newDocInstructions,
          guardrails: newDocGuardrails,
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addDocument({
          url: newDocUrl,
          name: newDocName,
          apiKey: newDocApiKey,
          customInstructions: newDocInstructions,
          guardrails: newDocGuardrails,
          isActive: true,
        }),
      );
    }

    // Clear form after saving new or editing
    setActiveDocId(null);
    setNewDocName("");
    setNewDocUrl("");
    setNewDocApiKey("");
    setNewDocInstructions("");
    setNewDocGuardrails("");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0A0A0A] flex flex-col h-full font-sans w-full items-center">


        {/* Main Content (Centered Form) */}
        <div className="flex-1 overflow-y-auto w-full pt-6 pb-12 px-6 flex justify-center">
          <div className="w-full max-w-2xl flex flex-col gap-8">
            <div className="bg-danger-50/50 dark:bg-danger-500/10 border-l-4 border-danger p-4 rounded-r-xl">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="text-danger w-4 h-4" />
                <h3 className="text-danger font-bold text-sm tracking-wide uppercase">
                  [!WARNING] HARD LAW
                </h3>
              </div>
              <p className="text-danger-800 dark:text-danger-200 text-xs font-medium">
                The entire system MUST strictly adhere to the Tri-Cloud Inference Strategy. There are absolutely NO EXCEPTIONS. Direct SDK connections to foundational models are blocked and forbidden for security reasons. All Document custom instructions and guardrails must enforce this.
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Documentation Name
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  placeholder="e.g. Stripe API Documentation"
                  size="lg"
                  value={newDocName}
                  variant="flat"
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Documentation URL
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  placeholder="https://docs.stripe.com/api"
                  size="lg"
                  startContent={
                    <Globe className="text-default-400 mr-2" size={16} />
                  }
                  value={newDocUrl}
                  variant="flat"
                  onChange={(e) => setNewDocUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  API Key
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <EyeOff className="w-5 h-5 text-default-400 pointer-events-none" />
                      ) : (
                        <Eye className="w-5 h-5 text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  placeholder="sk_test_..."
                  size="lg"
                  type={isVisible ? "text" : "password"}
                  value={newDocApiKey}
                  variant="flat"
                  onChange={(e) => setNewDocApiKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Custom Instructions
                </label>
                <Textarea
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  minRows={3}
                  placeholder="E.g. Always prefer v2 API endpoints, format payloads as JSON..."
                  size="lg"
                  value={newDocInstructions}
                  variant="flat"
                  onChange={(e) => setNewDocInstructions(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Safety Guardrails
                </label>
                <Textarea
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  minRows={3}
                  placeholder="E.g. Never use the API key in client-side code..."
                  size="lg"
                  value={newDocGuardrails}
                  variant="flat"
                  onChange={(e) => setNewDocGuardrails(e.target.value)}
                />
              </div>

              <div className="pt-4 flex w-full">
                <Button
                  className="w-full font-semibold"
                  color="primary"
                  isDisabled={!newDocUrl || !newDocName}
                  size="lg"
                  onPress={handleSaveDocument}
                >
                  {activeDocId ? "Save Changes" : "Add Documentation"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
