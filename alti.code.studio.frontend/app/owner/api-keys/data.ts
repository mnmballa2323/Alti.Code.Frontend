export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}

export const DUMMY_API_KEYS: ApiKey[] = [
  { id: "1", name: "Production API Key", prefix: "sk_prod_••••1234", created: "Oct 12, 2025", lastUsed: "Today", status: "Active" },
  { id: "2", name: "Staging API Key", prefix: "sk_test_••••5678", created: "Oct 10, 2025", lastUsed: "Yesterday", status: "Active" },
  { id: "3", name: "Development Key (Alice)", prefix: "sk_test_••••9012", created: "Sep 15, 2025", lastUsed: "2 weeks ago", status: "Active" },
  { id: "4", name: "Old Production Key", prefix: "sk_prod_••••3456", created: "Jan 1, 2025", lastUsed: "Oct 12, 2025", status: "Revoked" },
  { id: "5", name: "Mobile App Key", prefix: "sk_prod_••••7890", created: "Mar 15, 2025", lastUsed: "Today", status: "Active" },
];
