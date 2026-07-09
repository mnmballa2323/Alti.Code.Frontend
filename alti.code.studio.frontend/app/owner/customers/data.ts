export interface CustomerInfo {
  id: string;
  name: string;
  domain?: string;
  type: "Cloud" | "Dedicated" | "Sovereign";
  status: string;
  owner?: string;
  userCount: number;
}

export const DUMMY_CUSTOMERS: CustomerInfo[] = [
  // Cloud Customers
  {
    id: "cloud-1",
    name: "Ada Lovelace",
    domain: "ada.lovelace@alticodestudio.com",
    type: "Cloud",
    status: "active",
    owner: "ada.lovelace@alticodestudio.com",
    userCount: 12,
  },
  {
    id: "cloud-2",
    name: "Alan Turing",
    domain: "alan.turing@alticodestudio.com",
    type: "Cloud",
    status: "active",
    owner: "alan.turing@alticodestudio.com",
    userCount: 45,
  },
  {
    id: "cloud-3",
    name: "Marie Curie",
    domain: "marie.curie@alticodestudio.com",
    type: "Cloud",
    status: "active",
    owner: "marie.curie@alticodestudio.com",
    userCount: 89,
  },
  
  // Dedicated Customers
  {
    id: "acme-corp",
    name: "Acme Corp",
    domain: "acme.alticodestudio.com",
    type: "Dedicated",
    status: "active",
    owner: "admin@acme.com",
    userCount: 342,
  },
  {
    id: "stark-industries",
    name: "Stark Industries",
    domain: "stark.alticodestudio.com",
    type: "Dedicated",
    status: "active",
    owner: "pepper.potts@stark.com",
    userCount: 890,
  },
  {
    id: "cyberdyne",
    name: "Cyberdyne Systems",
    domain: "skynet.alticodestudio.com",
    type: "Dedicated",
    status: "active",
    owner: "miles.dyson@cyberdyne.com",
    userCount: 1045,
  },

  // Sovereign Customers
  {
    id: "jpmorgan-chase",
    name: "JPMorgan Chase",
    domain: "jpmc.alticodestudio.com",
    type: "Sovereign",
    status: "active",
    owner: "jamie.dimon@jpmchase.com",
    userCount: 14500,
  },
  {
    id: "nasa-hq",
    name: "NASA Jet Propulsion Lab",
    domain: "jpl.nasa.gov",
    type: "Sovereign",
    status: "active",
    owner: "director@jpl.nasa.gov",
    userCount: 8900,
  },
  {
    id: "amazon-web-services",
    name: "Amazon Web Services",
    domain: "aws.amazon.com",
    type: "Sovereign",
    status: "active",
    owner: "andy.jassy@amazon.com",
    userCount: 89000,
  },
  {
    id: "alphabet-inc",
    name: "Alphabet Inc.",
    domain: "google.com",
    type: "Sovereign",
    status: "active",
    owner: "sundar@google.com",
    userCount: 156000,
  },
];
