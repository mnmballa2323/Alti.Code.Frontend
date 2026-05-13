"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Link as LinkIcon,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  RefreshCw,
  Copy,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
  Chip,
} from "@heroui/react";

import ChatBotLayout from "@/components/ChatbotLayout";

type DnsRecord = { id: string; type: string; name: string; value: string };

export default function DomainsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [domainName, setDomainName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([
    { id: "1", type: "A", name: "@", value: "76.76.21.21" },
    { id: "2", type: "CNAME", name: "www", value: "cname.alti.studio" },
  ]);
  const [editingDnsId, setEditingDnsId] = useState<string | null>(null);
  const [editDnsForm, setEditDnsForm] = useState<Partial<DnsRecord>>({});

  useEffect(() => {
    const handleOpenModal = () => {
      setDomainName("");
      onOpen();
    };
    const handleSelectDomain = (e: any) => {
      setSelectedDomain(e.detail);
    };
    const handleDomainDeletedCleanup = (e: any) => {
      setSelectedDomain((prev) => (prev?.id === e.detail ? null : prev));
    };

    window.addEventListener("open-domain-modal", handleOpenModal);
    window.addEventListener("select-domain", handleSelectDomain);
    window.addEventListener(
      "domain-deleted-cleanup",
      handleDomainDeletedCleanup,
    );

    return () => {
      window.removeEventListener("open-domain-modal", handleOpenModal);
      window.removeEventListener("select-domain", handleSelectDomain);
      window.removeEventListener(
        "domain-deleted-cleanup",
        handleDomainDeletedCleanup,
      );
    };
  }, [onOpen]);

  const handleAddDomain = () => {
    if (domainName.trim()) {
      window.dispatchEvent(
        new CustomEvent("add-domain", { detail: domainName.trim() }),
      );
      setDomainName("");
    }
  };

  const handleEditDns = (rec: DnsRecord) => {
    setEditingDnsId(rec.id);
    setEditDnsForm(rec);
  };

  const handleSaveDns = () => {
    setDnsRecords((prev) =>
      prev.map((r) =>
        r.id === editingDnsId ? ({ ...r, ...editDnsForm } as DnsRecord) : r,
      ),
    );
    setEditingDnsId(null);
  };

  const handleDeleteDns = (id: string) => {
    setDnsRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddDns = () => {
    const newId = Date.now().toString();
    const newRec = { id: newId, type: "TXT", name: "", value: "" };

    setDnsRecords((prev) => [...prev, newRec]);
    setEditingDnsId(newId);
    setEditDnsForm(newRec);
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans">
        {selectedDomain ? (
          <div className="w-full max-w-2xl text-left bg-white dark:bg-[#111111] p-8 rounded-3xl border border-default-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-default-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                    {selectedDomain.name}
                  </h1>
                  <Chip
                    className="mt-2 font-medium"
                    color="warning"
                    size="sm"
                    startContent={
                      <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse ml-1" />
                    }
                    variant="flat"
                  >
                    Pending Verification
                  </Chip>
                </div>
              </div>
              <Button
                className="text-gray-500"
                size="sm"
                startContent={<RefreshCw size={14} />}
                variant="bordered"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    DNS Configuration
                  </h3>
                  <Button
                    className="bg-default-100 hover:bg-default-200 text-sm font-medium text-gray-900 dark:text-gray-100 h-8"
                    size="sm"
                    startContent={<Plus size={14} />}
                    variant="flat"
                    onPress={handleAddDns}
                  >
                    Add Record
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Manage the DNS records for your domain to route traffic to
                  Alti.
                </p>
                <div className="bg-default-50 dark:bg-black/50 rounded-xl font-mono text-sm border border-default-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-default-200 bg-default-100/50 dark:bg-white/5">
                        <th className="py-3 px-4 font-medium w-[120px]">
                          Type
                        </th>
                        <th className="py-3 px-4 font-medium w-[150px]">
                          Name
                        </th>
                        <th className="py-3 px-4 font-medium">Value</th>
                        <th className="py-3 px-4 font-medium w-[100px] text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dnsRecords.map((rec) => {
                        const isEditing = editingDnsId === rec.id;

                        return (
                          <tr
                            key={rec.id}
                            className="border-b border-default-100 last:border-0 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <select
                                  className="w-full bg-white dark:bg-default-100 border border-default-300 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                                  value={editDnsForm.type}
                                  onChange={(e) =>
                                    setEditDnsForm({
                                      ...editDnsForm,
                                      type: e.target.value,
                                    })
                                  }
                                >
                                  <option value="A">A</option>
                                  <option value="CNAME">CNAME</option>
                                  <option value="TXT">TXT</option>
                                  <option value="MX">MX</option>
                                </select>
                              ) : (
                                <span className="bg-default-200 dark:bg-default-100/10 text-default-700 px-2 py-0.5 rounded text-xs font-bold">
                                  {rec.type}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  className="w-full bg-white dark:bg-default-100 border border-default-300 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                                  placeholder="@"
                                  value={editDnsForm.name}
                                  onChange={(e) =>
                                    setEditDnsForm({
                                      ...editDnsForm,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400 font-mono text-[13px]">
                                  {rec.name}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <input
                                  className="w-full bg-white dark:bg-default-100 border border-default-300 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                                  placeholder="Value"
                                  value={editDnsForm.value}
                                  onChange={(e) =>
                                    setEditDnsForm({
                                      ...editDnsForm,
                                      value: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <div
                                  className="flex items-center gap-2 group/value cursor-pointer"
                                  onClick={() =>
                                    navigator.clipboard.writeText(rec.value)
                                  }
                                >
                                  <span className="text-gray-900 dark:text-gray-300 font-mono text-[13px] truncate max-w-[200px] transition-colors group-hover/value:text-primary">
                                    {rec.value}
                                  </span>
                                  <Copy
                                    className="opacity-0 group-hover/value:opacity-100 text-gray-400 hover:text-primary transition-all"
                                    size={12}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                                    onClick={handleSaveDns}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    className="p-1.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-md transition-colors"
                                    onClick={() => setEditingDnsId(null)}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="p-1.5 text-gray-500 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
                                    onClick={() => handleEditDns(rec)}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors"
                                    onClick={() => handleDeleteDns(rec.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {dnsRecords.length === 0 && (
                        <tr>
                          <td
                            className="py-8 text-center text-gray-500"
                            colSpan={4}
                          >
                            No DNS records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  SSL Certificate
                </h3>
                <div className="bg-gradient-to-r from-default-100 to-default-50 dark:from-black/50 dark:to-black/20 p-5 rounded-xl border border-default-200 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 left-0 w-1 h-full bg-warning animate-pulse" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                        <Loader2 className="w-5 h-5 text-warning animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Provisioning Certificate...
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                          Alti is currently negotiating a TLS certificate with
                          Let's Encrypt. This process will automatically
                          complete once DNS propagation is verified.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl bg-white dark:bg-[#111111] p-12 rounded-3xl border border-default-200 shadow-sm border-dashed">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              Sovereign DNS Infrastructure
            </h1>
            <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
              Configure custom domains, deploy globally distributed edge routes,
              and manage automated TLS/SSL certificates for your enterprise
              environments.
            </p>
            <Button
              className="bg-black text-white dark:bg-white dark:text-black font-medium px-8"
              startContent={<Plus size={16} />}
              onPress={onOpen}
            >
              Add Custom Domain
            </Button>
          </div>
        )}
      </div>

      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        size="xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="bg-white dark:bg-black shadow-2xl border border-default-200">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <h2 className="text-xl font-semibold tracking-tight text-default-900">
                  Add Custom Domain
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-default-500 mb-4">
                  Enter the domain you'd like to route to your Alti deployments.
                  <br />
                  Make sure you have access to its DNS records.
                </p>
                <Input
                  autoFocus
                  classNames={{
                    input: "text-sm",
                    inputWrapper:
                      "bg-default-100 dark:bg-default-50 border border-transparent hover:border-default-400 focus-within:!border-primary focus-within:bg-white dark:focus-within:bg-black transition-colors",
                  }}
                  placeholder="e.g., api.mycompany.com"
                  startContent={<Globe className="w-4 h-4 text-default-400" />}
                  value={domainName}
                  variant="flat"
                  onChange={(e) => setDomainName(e.target.value)}
                />
              </ModalBody>
              <ModalFooter className="pt-6">
                <Button
                  className="bg-gray-200 dark:bg-zinc-800 text-black dark:text-white font-medium shadow-sm hover:opacity-80"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white dark:bg-white dark:text-black font-medium shadow-md"
                  isDisabled={!domainName.trim()}
                  onPress={() => {
                    handleAddDomain();
                    onClose();
                  }}
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Link Domain
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
