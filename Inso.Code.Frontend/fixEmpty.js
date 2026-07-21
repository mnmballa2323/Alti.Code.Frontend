const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const replacements = {
  'icon: "logos:braintree"': 'icon: "mdi:credit-card"',
  'icon: "logos:brevo"': 'icon: "mdi:email-fast"'
};

for (const [oldIcon, newIcon] of Object.entries(replacements)) {
  content = content.replace(oldIcon, newIcon);
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed Braintree and Brevo");
