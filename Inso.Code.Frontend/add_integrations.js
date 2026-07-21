const fs = require("fs");

const integrations = [
  { id: "notion", name: "Notion", category: "Productivity", color: "#000000" },
  { id: "asana", name: "Asana", category: "Productivity", color: "#F06A6A" },
  { id: "trello", name: "Trello", category: "Productivity", color: "#0052CC" },
  { id: "zoom", name: "Zoom", category: "Communication", color: "#2D8CFF" },
  { id: "microsoftteams", name: "Microsoft Teams", category: "Communication", color: "#6264A7" },
  { id: "dropbox", name: "Dropbox", category: "Storage", color: "#0061FF" },
  { id: "googledrive", name: "Google Drive", category: "Storage", color: "#4285F4" },
  { id: "zendesk", name: "Zendesk", category: "Customer Support", color: "#03363D" },
  { id: "intercom", name: "Intercom", category: "Customer Support", color: "#286EFA" },
  { id: "hubspot", name: "HubSpot", category: "CRM", color: "#FF7A59" },
  { id: "salesforce", name: "Salesforce", category: "CRM", color: "#00A1E0" },
  { id: "snowflake", name: "Snowflake", category: "Data", color: "#29B5E8" },
  { id: "mongodb", name: "MongoDB", category: "Database", color: "#47A248" },
  { id: "postgresql", name: "PostgreSQL", category: "Database", color: "#4169E1" },
  { id: "mysql", name: "MySQL", category: "Database", color: "#4479A1" },
  { id: "redis", name: "Redis", category: "Database", color: "#DC382D" },
  { id: "auth0", name: "Auth0", category: "Authentication", color: "#EB5424" },
  { id: "okta", name: "Okta", category: "Authentication", color: "#007DC1" },
  { id: "supabase", name: "Supabase", category: "Backend", color: "#3ECF8E" },
  { id: "appwrite", name: "Appwrite", category: "Backend", color: "#FD366E" },
  { id: "netlify", name: "Netlify", category: "DevOps", color: "#00C7B7" },
  { id: "render", name: "Render", category: "DevOps", color: "#46E3B7" },
  { id: "digitalocean", name: "DigitalOcean", category: "Cloud", color: "#0080FF" },
  { id: "amazonaws", name: "AWS", category: "Cloud", color: "#232F3E" },
  { id: "googlecloud", name: "Google Cloud", category: "Cloud", color: "#4285F4" },
  { id: "microsoftazure", name: "Microsoft Azure", category: "Cloud", color: "#0089D6" },
  { id: "twilio", name: "Twilio", category: "Communication", color: "#F22F46" },
  { id: "stripe", name: "Stripe", category: "Payments", color: "#008CDD" },
  { id: "paypal", name: "PayPal", category: "Payments", color: "#00457C" },
  { id: "square", name: "Square", category: "Payments", color: "#3E4348" },
  { id: "woocommerce", name: "WooCommerce", category: "E-Commerce", color: "#96588A" },
  { id: "magento", name: "Magento", category: "E-Commerce", color: "#EE672F" },
  { id: "discord", name: "Discord", category: "Communication", color: "#5865F2" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", color: "#FFE01B" },
  { id: "figma", name: "Figma", category: "Design", color: "#F24E1E" },
  { id: "docker", name: "Docker", category: "DevOps", color: "#2496ED" },
  { id: "kubernetes", name: "Kubernetes", category: "DevOps", color: "#326CE5" },
  { id: "jenkins", name: "Jenkins", category: "DevOps", color: "#D24939" },
  { id: "gitlab", name: "GitLab", category: "DevOps", color: "#FC6D26" },
  { id: "bitbucket", name: "Bitbucket", category: "DevOps", color: "#0052CC" }
];

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");

// Remove the last `];`
fileContent = fileContent.replace(/\n\];[\s\n]*$/, "");

// Add each integration
integrations.forEach(i => {
  const item = `,\n  {
    id: "${i.id}-expert",
    name: "${i.name} Specialist AI",
    role: "${i.name} Architect",
    type: "integration",
    category: "${i.category}",
    specialties: ["API Integration", "Webhooks", "SDK Configuration"],
    bio: "Integrates and configures ${i.name} services into your application.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${i.color}",
    icon: "simple-icons:${i.id}",
  }`;
  fileContent += item;
});

// Close array
fileContent += "\n];\n";

fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log("Added 40 integrations.");
