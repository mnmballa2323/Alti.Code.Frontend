export interface PlatformLogin {
  id: string;
  platform: string;
  website: string;
  username: string;
  passwordPlaceholder: string;
  password: string;
}

export const DUMMY_LOGINS: PlatformLogin[] = [
  { id: "1", platform: "Stripe", website: "dashboard.stripe.com", username: "finance@company.com", passwordPlaceholder: "••••••••••••", password: "Str!peSecure99$" },
  { id: "2", platform: "AWS Console", website: "aws.amazon.com", username: "admin@company.com", passwordPlaceholder: "••••••••••••", password: "AwsAdminConsole!2" },
  { id: "3", platform: "Vercel", website: "vercel.com", username: "dev@company.com", passwordPlaceholder: "••••••••••••", password: "VercelDeploy^23" },
  { id: "4", platform: "MongoDB Atlas", website: "cloud.mongodb.com", username: "db-admin@company.com", passwordPlaceholder: "••••••••••••", password: "MongoDbSecure!1" },
  { id: "5", platform: "GitHub", website: "github.com", username: "company-bot", passwordPlaceholder: "••••••••••••", password: "GithubBotToken22" },
  { id: "6", platform: "SendGrid", website: "app.sendgrid.com", username: "marketing@company.com", passwordPlaceholder: "••••••••••••", password: "SendGridEmail!7" },
  { id: "7", platform: "Twilio", website: "twilio.com", username: "ops@company.com", passwordPlaceholder: "••••••••••••", password: "TwilioOpsSecret$" },
  { id: "8", platform: "Zendesk", website: "company.zendesk.com", username: "support-admin@company.com", passwordPlaceholder: "••••••••••••", password: "ZendeskSupport!" },
  { id: "9", platform: "Slack Admin", website: "slack.com/admin", username: "hr@company.com", passwordPlaceholder: "••••••••••••", password: "SlackAdminHRLol!" },
  { id: "10", platform: "Google Workspace", website: "admin.google.com", username: "superadmin@company.com", passwordPlaceholder: "••••••••••••", password: "GoogleAdminPass^8" },
];
