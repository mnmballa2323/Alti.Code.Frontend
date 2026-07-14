const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const domains = {
  "Clearbit Specialist AI": "clearbit.com",
  "Clevertap Specialist AI": "clevertap.com",
  "MoEngage Specialist AI": "moengage.com",
  "Marketo Specialist AI": "marketo.com",
  "Salesloft Specialist AI": "salesloft.com",
  "Gong Specialist AI": "gong.io",
  "ZoomInfo Specialist AI": "zoominfo.com",
  "Deel Specialist AI": "deel.com",
  "Stripe Connect Specialist AI": "stripe.com",
  "Razorpay Specialist AI": "razorpay.com",
  "Klarna Specialist AI": "klarna.com",
  "Builder.io Specialist AI": "builder.io",
  "TinaCMS Specialist AI": "tina.io",
  "KeystoneJS Specialist AI": "keystonejs.com",
  "Airtable Specialist AI": "airtable.com",
  "Freshdesk Specialist AI": "freshdesk.com",
  "Help Scout Specialist AI": "helpscout.com",
  "Drift Specialist AI": "drift.com",
  "Greenhouse Specialist AI": "greenhouse.io",
  "15Five Specialist AI": "15five.com",
  "Twilio SendGrid Specialist AI": "sendgrid.com",
  "RingCentral Specialist AI": "ringcentral.com",
  "Aircall Specialist AI": "aircall.io",
  "Cloudflare Specialist AI": "cloudflare.com",
  "Chainlink Specialist AI": "chain.link"
};

for (const [name, domain] of Object.entries(domains)) {
  const url = `https://logo.clearbit.com/${domain}`;
  const regex = new RegExp(`name:\\s*"${name}"[\\s\\S]*?icon:\\s*"[^"]+"`, 'g');
  content = content.replace(regex, match => match.replace(/icon:\s*"[^"]+"/, `icon: "${url}"`));
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Forced Clearbit domains!");
