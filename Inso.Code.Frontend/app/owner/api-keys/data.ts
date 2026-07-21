export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}

export const DUMMY_API_KEYS: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    prefix: "sk_prod_aB3dE8fG2hJ5kL9mN4pQ7rS1tV6wX0yZ1234",
    created: "Oct 12, 2025",
    lastUsed: "Today",
    status: "Active",
  },
  {
    id: "2",
    name: "Staging API Key",
    prefix: "sk_test_cR9mT4pV2xZ7nK1jL5hB8fG3dE6wY0qS5678",
    created: "Oct 10, 2025",
    lastUsed: "Yesterday",
    status: "Active",
  },
  {
    id: "3",
    name: "Development Key (Alice)",
    prefix: "sk_test_vN2bM5cR8xZ1lK4jH7fG0dE3wY6qS9pT9012",
    created: "Sep 15, 2025",
    lastUsed: "2 weeks ago",
    status: "Active",
  },
  {
    id: "4",
    name: "Old Production Key",
    prefix: "sk_prod_kL5jH2fG8dE1wY4qS7pT0vN3bM6cR9xZ3456",
    created: "Jan 1, 2025",
    lastUsed: "Oct 12, 2025",
    status: "Revoked",
  },
  {
    id: "5",
    name: "Mobile App Key",
    prefix: "sk_prod_xZ1lK4jH7fG0dE3wY6qS9pT2vN5bM8cR7890",
    created: "Mar 15, 2025",
    lastUsed: "Today",
    status: "Active",
  },
];
