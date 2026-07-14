const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const regex = /name:\s*"([^"]+) Specialist AI"[\s\S]*?icon:\s*"solar:plug-circle-bold-duotone"/g;

let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  let name = match[1];
  let rawName = name.toLowerCase().replace(/ /g, '');
  let domain = rawName;
  if (!domain.includes('.')) {
    domain += '.com';
  }
  
  // Custom overrides for tricky ones
  if (name === "Twitch API") domain = "twitch.tv";
  if (name === "Plausible") domain = "plausible.io";
  if (name === "Commerce Tools") domain = "commercetools.com";
  if (name === "Wix eCommerce") domain = "wix.com";
  if (name === "Stripe Connect") domain = "stripe.com";
  if (name === "Backblaze B2") domain = "backblaze.com";
  if (name === "JazzHR") domain = "jazzhr.com";
  if (name === "BambooHR") domain = "bamboohr.com";
  if (name === "HiBob") domain = "hibob.com";
  
  const url = `https://logo.clearbit.com/${domain}`;
  
  content = content.replace(match[0], match[0].replace('solar:plug-circle-bold-duotone', url));
  count++;
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log(`Forced ${count} remaining icons to Clearbit URL`);
