export interface PlatformLogin {
  id: string;
  platform: string;
  website: string;
  username: string;
  password: string;
}

export const DUMMY_LOGINS: PlatformLogin[] = [
  {
    id: "1",
    platform: "Stripe",
    website: "dashboard.stripe.com",
    username: "finance@company.com",
    password: "Str!peSecure99$",
  },
  {
    id: "2",
    platform: "AWS Console",
    website: "aws.amazon.com",
    username: "admin@company.com",
    password: "AwsAdminConsole!2",
  },
  {
    id: "3",
    platform: "Vercel",
    website: "vercel.com",
    username: "dev@company.com",
    password: "VercelDeploy^23",
  },
  {
    id: "4",
    platform: "MongoDB Atlas",
    website: "cloud.mongodb.com",
    username: "db-admin@company.com",
    password: "MongoDbSecure!1",
  },
  {
    id: "5",
    platform: "GitHub",
    website: "github.com",
    username: "company-bot",
    password: "GithubBotToken22",
  },
  {
    id: "6",
    platform: "SendGrid",
    website: "app.sendgrid.com",
    username: "marketing@company.com",
    password: "SendGridEmail!7",
  },
  {
    id: "7",
    platform: "Twilio",
    website: "twilio.com",
    username: "ops@company.com",
    password: "TwilioOpsSecret$",
  },
  {
    id: "8",
    platform: "Zendesk",
    website: "company.zendesk.com",
    username: "support-admin@company.com",
    password: "ZendeskSupport!",
  },
  {
    id: "9",
    platform: "Slack Admin",
    website: "slack.com/admin",
    username: "hr@company.com",
    password: "SlackAdminHRLol!",
  },
  {
    id: "10",
    platform: "Google Workspace",
    website: "admin.google.com",
    username: "superadmin@company.com",
    password: "GoogleAdminPass^8",
  },
];
