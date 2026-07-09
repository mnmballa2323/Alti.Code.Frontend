export interface EmailAccount {
  id: string;
  address: string;
  provider: string;
  type: string;
  status: "Connected" | "Error";
}

export const DUMMY_EMAILS: EmailAccount[] = [
  { id: "1", address: "support@company.com", provider: "Google Workspace", type: "Inbound/Outbound", status: "Connected" },
  { id: "2", address: "billing@company.com", provider: "SendGrid", type: "Outbound Only", status: "Connected" },
  { id: "3", address: "no-reply@company.com", provider: "Amazon SES", type: "Outbound Only", status: "Connected" },
  { id: "4", address: "sales@company.com", provider: "Microsoft 365", type: "Inbound/Outbound", status: "Error" },
  { id: "5", address: "marketing@company.com", provider: "Mailgun", type: "Outbound Only", status: "Connected" },
];
