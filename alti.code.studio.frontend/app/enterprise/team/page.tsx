"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Users,
  Building,
  UserPlus,
  Trash2,
  Save,
  CreditCard,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { getUserData } from "@/lib/user";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [inviting, setInviting] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const profileResult = await getUserData(token);
      if (profileResult?.success && profileResult?.data) {
        setCurrentUser(profileResult.data);
        if (profileResult.data.tenant) {
          setTeamName(profileResult.data.tenant.name);
        }
      }

      const res = await teamAPI.members();
      if (res && res.members) {
        setMembers(res.members);
      }
    } catch (err) {
      console.error("Failed to load team data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenameTeam = async () => {
    if (!teamName.trim()) return;
    setSavingName(true);
    try {
      await teamAPI.renameTeam({ name: teamName });
      alert("Workspace name updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update workspace name");
    }
    setSavingName(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await teamAPI.inviteMember({ email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      await fetchData();
      alert("Member invited successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to invite member");
    }
    setInviting(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await teamAPI.removeMember(userId);
      await fetchData();
      alert("Member removed from team");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">Loading Workspace Settings...</span>
      </div>
    );
  }

  // Calculate dynamic seat billing
  const seatsCount = members.length || 1;
  const basePlanPrice = currentUser?.subscriptionPrice || 100.0;
  const seatPrice = 20.0;
  const totalBilling = basePlanPrice + (seatsCount - 1) * seatPrice;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Workspace Settings</h2>
        <p className="text-sm text-default-400">
          Manage your multi-tenant workspace team, invitations, and dynamic seat billing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rename Team & Invite Members */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Info Card */}
          <Card className="bg-white/5 border border-white/10 shadow-xl">
            <CardHeader className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Workspace Identity</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 px-6 py-5">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="Workspace Name"
                    placeholder="Enter team workspace name"
                    value={teamName}
                    variant="bordered"
                    labelPlacement="outside"
                    classNames={{
                      label: "text-white/80 font-medium pb-1.5",
                      input: "text-white",
                    }}
                    onValueChange={setTeamName}
                  />
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20"
                  isLoading={savingName}
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleRenameTeam}
                >
                  Save
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Members List Table Card */}
          <Card className="bg-white/5 border border-white/10 shadow-xl">
            <CardHeader className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Team Members</h3>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table isStriped removeWrapper aria-label="Team Members">
                <TableHeader>
                  <TableColumn>MEMBER</TableColumn>
                  <TableColumn>WORKSPACE ROLE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn align="center">ACTION</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No members added yet. Invite your colleagues!">
                  {members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{member.email}</span>
                          <span className="text-xs text-default-400">ID: {member.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={member.tenantRole === "owner" ? "secondary" : "primary"}
                          size="sm"
                          variant="flat"
                        >
                          {member.tenantRole?.toUpperCase() || "DEVELOPER"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color="success" size="sm" variant="dot">
                          Active
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {member.tenantRole !== "owner" && (
                          <Button
                            color="danger"
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Invite Member Form & Billing Seats */}
        <div className="space-y-6">
          {/* Invite Member Card */}
          <Card className="bg-white/5 border border-white/10 shadow-xl">
            <CardHeader className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Invite Member</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 px-6 py-5">
              <Input
                label="Email Address"
                placeholder="colleague@example.com"
                value={inviteEmail}
                variant="bordered"
                labelPlacement="outside"
                classNames={{
                  label: "text-white/80 font-medium pb-1.5",
                  input: "text-white",
                }}
                onValueChange={setInviteEmail}
              />
              <Select
                label="Workspace Role"
                selectedKeys={[inviteRole]}
                variant="bordered"
                labelPlacement="outside"
                classNames={{
                  label: "text-white/80 font-medium pb-1.5",
                  value: "text-white",
                }}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <SelectItem key="admin" className="text-black dark:text-white">Admin</SelectItem>
                <SelectItem key="developer" className="text-black dark:text-white">Developer</SelectItem>
                <SelectItem key="viewer" className="text-black dark:text-white">Viewer</SelectItem>
              </Select>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20"
                isLoading={inviting}
                startContent={<UserPlus className="w-4 h-4" />}
                onPress={handleInviteMember}
              >
                Send Invitation
              </Button>
            </CardBody>
          </Card>

          {/* Billing seat summary */}
          <Card className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 shadow-xl">
            <CardBody className="space-y-4 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-white">Dynamic Seat Billing</span>
                </div>
                <Chip color="secondary" variant="flat">
                  {currentUser?.subscriptionPlan || "Launch"} Plan
                </Chip>
              </div>

              <div className="space-y-2 py-3 border-y border-white/10">
                <div className="flex justify-between text-sm text-default-300">
                  <span>Base Plan Cost</span>
                  <span>${basePlanPrice.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between text-sm text-default-300">
                  <span>Additional Seats ({seatsCount - 1} seat(s))</span>
                  <span>+${((seatsCount - 1) * seatPrice).toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-2">
                  <span>Total Recurring</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    ${totalBilling.toFixed(2)}/mo
                  </span>
                </div>
              </div>

              <div className="flex gap-2 items-start text-xs text-default-400">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Like Vercel, workspace members are put directly on the owner's billing. 
                  Adding or removing active developer seats takes effect immediately.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
