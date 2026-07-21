export interface EmailAccount {
  id: string;
  address: string;
  password: string;
}

export const DUMMY_EMAILS: EmailAccount[] = [
  {
    id: "1",
    address: "support@company.com",
    password: "SuperSecretPassword1!",
  },
  {
    id: "2",
    address: "billing@company.com",
    password: "BillingSecure2025#",
  },
  {
    id: "3",
    address: "no-reply@company.com",
    password: "NoReplyAutoGen99$",
  },
  {
    id: "4",
    address: "sales@company.com",
    password: "SalesTeamAccess42@",
  },
  {
    id: "5",
    address: "marketing@company.com",
    password: "MktgCampaign2025!",
  },
];
