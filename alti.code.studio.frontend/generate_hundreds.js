const fs = require('fs');

const massiveList = [
  // Analytics
  "Google Analytics", "Mixpanel", "Amplitude", "Heap", "Segment", "PostHog", "Matomo", "Plausible", "Fathom", "Clevertap", "MoEngage",
  // Marketing & Sales
  "Marketo", "Pardot", "ActiveCampaign", "Klaviyo", "Braze", "Customer.io", "Mailgun", "Postmark", "Apollo.io", "Outreach", "Salesloft", "Gong", "Clearbit", "ZoomInfo", "Brevo",
  // E-commerce
  "BigCommerce", "Commerce Tools", "Spree", "Sylius", "PrestaShop", "Ecwid", "Wix eCommerce", "Squarespace", "Etsy", "Amazon Seller",
  // ERP & Finance
  "NetSuite", "SAP", "Oracle ERP", "Workday", "QuickBooks", "Xero", "FreshBooks", "Wave", "Expensify", "Gusto", "Rippling", "Deel", "Stripe Connect", "Adyen", "Braintree", "Razorpay", "Mollie", "Klarna", "Affirm", "Sezzle",
  // CMS & Content
  "WordPress", "Ghost", "Joomla", "Drupal", "Webflow", "Framer", "Prismic", "Storyblok", "Hygraph", "Builder.io", "TinaCMS", "KeystoneJS", "Statamic",
  // Dev Tools & Infrastructure
  "CircleCI", "Travis CI", "GitHub Actions", "Bitrise", "Codecov", "SonarQube", "Snyk", "Dependabot", "Vagrant", "Terraform", "Pulumi", "Ansible", "Chef", "Puppet", "Prometheus", "Grafana", "New Relic", "Dynatrace", "AppDynamics", "Splunk", "Elasticsearch", "Logstash", "Kibana", "Fluentd", "Graylog", "Sentry", "Bugsnag", "Rollbar", "Datadog", "PagerDuty", "VictorOps", "Opsgenie",
  // DB & Storage
  "Cassandra", "ScyllaDB", "Neo4j", "ArangoDB", "CouchDB", "Couchbase", "DynamoDB", "CosmosDB", "MariaDB", "TiDB", "CockroachDB", "PlanetScale", "Neon", "Xata", "Fauna", "Firebase Realtime", "Firestore", "MinIO", "Backblaze B2", "Wasabi", "Box",
  // Collaboration & Project Mgmt
  "Basecamp", "Monday.com", "Wrike", "Smartsheet", "Airtable", "ClickUp", "Notion", "Coda", "Miro", "Mural", "Lucidchart", "Whimsical",
  // Support & Success
  "Freshdesk", "Zoho Desk", "Help Scout", "Kustomer", "Front", "Gorgias", "Intercom", "Drift", "Crisp", "Tidio",
  // HR & Recruiting
  "Greenhouse", "Lever", "Workable", "Breezy", "JazzHR", "BambooHR", "HiBob", "Lattice", "15Five", "CultureAmp",
  // Productivity & Communication
  "Twilio SendGrid", "MessageBird", "Sinch", "Vonage", "Plivo", "RingCentral", "Dialpad", "Aircall",
  // Video & Streaming
  "Mux", "Agora", "Daily.co", "Livepeer", "Twitch API", "YouTube API", "Vimeo API",
  // Search & Discovery
  "Algolia", "Typesense", "Elasticsearch", "OpenSearch", "Pinecone", "Milvus", "Weaviate", "Qdrant", "Chroma",
  // AI & ML Services
  "OpenAI", "Anthropic", "Cohere", "Hugging Face", "Replicate", "Baseten", "Modal", "RunPod", "Together AI", "Scale AI", "AssemblyAI", "Deepgram", "ElevenLabs",
  // Identity & Security
  "Auth0", "Clerk", "Kinde", "Stytch", "WorkOS", "Frontegg", "Ory", "Keycloak", "FusionAuth", "Ping Identity", "Okta", "OneLogin", "Duo Security", "Cloudflare", "Fastly", "Akamai", "Tailscale", "ZeroTier", "Ngrok",
  // Web3 & Crypto
  "Alchemy", "Infura", "Moralis", "QuickNode", "Tenderly", "The Graph", "Chainlink", "Helium", "Arweave", "IPFS", "Filecoin"
];

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");
fileContent = fileContent.replace(/\n\];[\s\n]*$/, "");

// We'll generate random hex colors for variety
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Convert string to a valid ID
function toId(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

massiveList.forEach(name => {
  const id = toId(name);
  if (!fileContent.includes(`id: "${id}-expert"`)) {
    const item = `,\n  {
    id: "${id}-expert",
    name: "${name} Specialist AI",
    role: "${name} Architect",
    type: "integration",
    category: "Integration",
    specialties: ["API Integration", "Webhooks", "SDK Configuration"],
    bio: "Expertly integrates and manages ${name} workflows for your stack.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${getRandomColor()}",
    icon: "lucide:puzzle",
  }`;
    fileContent += item;
  }
});

fileContent += "\n];\n";
fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log(`Added massive list of integrations. Total new: ${massiveList.length}`);
