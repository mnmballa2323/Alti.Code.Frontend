const fs = require('fs');

const iconMap = {
  "15Five": "logos:15five",
  "ActiveCampaign": "logos:activecampaign-icon",
  "Adyen": "logos:adyen",
  "Affirm": "logos:affirm",
  "Agora": "logos:agora",
  "Aircall": "logos:aircall",
  "Airtable": "logos:airtable",
  "Alchemy": "logos:alchemy",
  "Algolia": "logos:algolia",
  "Amazon Seller": "logos:aws",
  "Amplitude": "logos:amplitude-icon",
  "Ansible": "logos:ansible",
  "Apollo.io": "logos:apollo",
  "AppDynamics": "logos:appdynamics",
  "Appwrite": "logos:appwrite",
  "Auth0": "logos:auth0-icon",
  "AWS": "logos:aws",
  "Azure": "logos:microsoft-azure",
  "Basecamp": "logos:basecamp",
  "Bitbucket": "logos:bitbucket",
  "Bitrise": "logos:bitrise",
  "Box": "logos:box",
  "Braintree": "logos:braintree",
  "Braze": "logos:braze",
  "Brevo": "logos:brevo",
  "Bugsnag": "logos:bugsnag-icon",
  "CircleCI": "logos:circleci",
  "Clearbit": "logos:clearbit",
  "Clerk": "logos:clerk",
  "ClickUp": "logos:clickup-icon",
  "Cloudflare": "logos:cloudflare-icon",
  "CockroachDB": "logos:cockroachdb",
  "Coda": "logos:coda-icon",
  "Codecov": "logos:codecov-icon",
  "Contentful": "logos:contentful",
  "Couchbase": "logos:couchbase",
  "CouchDB": "logos:couchdb",
  "Customer.io": "logos:customerio-icon",
  "Datadog": "logos:datadog",
  "DigitalOcean": "logos:digital-ocean",
  "Discord": "logos:discord-icon",
  "Docker": "logos:docker-icon",
  "Drift": "logos:drift",
  "Drupal": "logos:drupal",
  "Dynatrace": "logos:dynatrace-icon",
  "Elasticsearch": "logos:elasticsearch",
  "Etsy": "logos:etsy",
  "Fauna": "logos:fauna",
  "Figma": "logos:figma",
  "Firebase": "logos:firebase",
  "Firestore": "logos:firebase",
  "Framer": "logos:framer",
  "FreshBooks": "logos:freshbooks",
  "Freshdesk": "logos:freshdesk",
  "Front": "logos:front",
  "GCP": "logos:google-cloud",
  "Ghost": "logos:ghost",
  "GitHub": "logos:github-icon",
  "GitHub Actions": "logos:github-actions",
  "GitLab": "logos:gitlab",
  "Google Analytics": "logos:google-analytics",
  "Grafana": "logos:grafana",
  "Greenhouse": "logos:greenhouse",
  "Hugging Face": "logos:hugging-face",
  "Ionic": "logos:ionic",
  "Jira": "logos:jira",
  "Joomla": "logos:joomla",
  "Kibana": "logos:kibana",
  "Klaviyo": "logos:klaviyo",
  "Linear": "logos:linear-icon",
  "Logstash": "logos:logstash",
  "Lucidchart": "logos:lucidchart",
  "Magento": "logos:magento",
  "Mailchimp": "logos:mailchimp",
  "Mailgun": "logos:mailgun-icon",
  "MariaDB": "logos:mariadb-icon",
  "Marketo": "logos:marketo",
  "Miro": "logos:miro-icon",
  "Mixpanel": "logos:mixpanel",
  "Monday.com": "logos:monday-icon",
  "MongoDB": "logos:mongodb-icon",
  "MySQL": "logos:mysql",
  "Neo4j": "logos:neo4j",
  "Netlify": "logos:netlify-icon",
  "New Relic": "logos:new-relic",
  "Notion": "logos:notion-icon",
  "Okta": "logos:okta",
  "Opsgenie": "logos:opsgenie",
  "Oracle Cloud": "logos:oracle",
  "PagerDuty": "logos:pagerduty-icon",
  "PayPal": "logos:paypal",
  "Plaid": "logos:plaid",
  "Plausible": "logos:plausible",
  "PostHog": "logos:posthog-icon",
  "Postmark": "logos:postmark",
  "PostgreSQL": "logos:postgresql",
  "PrestaShop": "logos:prestashop",
  "Prismic": "logos:prismic-icon",
  "Prometheus": "logos:prometheus",
  "Puppet": "logos:puppet-icon",
  "React": "logos:react",
  "Redis": "logos:redis",
  "Render": "logos:render",
  "Salesforce": "logos:salesforce",
  "Sanity": "logos:sanity",
  "Sentry": "logos:sentry-icon",
  "Shopify": "logos:shopify",
  "Slack": "logos:slack-icon",
  "Smartsheet": "logos:smartsheet",
  "Snowflake": "logos:snowflake-icon",
  "Snyk": "logos:snyk",
  "SonarQube": "logos:sonarqube",
  "Splunk": "logos:splunk",
  "Square": "logos:square",
  "Squarespace": "logos:squarespace",
  "Stripe": "logos:stripe",
  "Supabase": "logos:supabase-icon",
  "Tailscale": "logos:tailscale-icon",
  "Trello": "logos:trello",
  "Twilio": "logos:twilio-icon",
  "Twitch API": "logos:twitch",
  "Vagrant": "logos:vagrant",
  "Vercel": "logos:vercel-icon",
  "Vimeo API": "logos:vimeo-icon",
  "Webflow": "logos:webflow",
  "WooCommerce": "logos:woocommerce",
  "Wrike": "logos:wrike-icon",
  "Xero": "logos:xero",
  "YouTube API": "logos:youtube-icon",
  "Zendesk": "logos:zendesk",
  "Zoom": "logos:zoom-icon"
};

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

for (const [name, icon] of Object.entries(iconMap)) {
  const nameStr = `name: "${name} Specialist AI"`;
  
  let startIndex = 0;
  while (true) {
    const nameIdx = content.indexOf(nameStr, startIndex);
    if (nameIdx === -1) break;
    
    const iconIdx = content.indexOf('icon: ', nameIdx);
    const objEndIdx = content.indexOf('},', nameIdx);
    
    if (iconIdx !== -1 && iconIdx < objEndIdx) {
      const lineEndIdx = content.indexOf('\n', iconIdx);
      const before = content.substring(0, iconIdx);
      const after = content.substring(lineEndIdx);
      content = before + `icon: "${icon}",` + after;
    }
    
    startIndex = nameIdx + nameStr.length;
  }
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Updated integration icons");
