const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const replacements = {
  'icon: "logos:15five"': 'icon: "mdi:account-group"',
  'icon: "logos:activecampaign-icon"': 'icon: "mdi:email-fast"',
  'icon: "logos:affirm"': 'icon: "mdi:cash-check"',
  'icon: "logos:agora"': 'icon: "mdi:video-wireless"',
  'icon: "logos:aircall"': 'icon: "mdi:phone-in-talk"',
  'icon: "logos:alchemy"': 'icon: "mdi:flask"',
  'icon: "logos:apollo"': 'icon: "mdi:rocket-launch"'
};

for (const [oldIcon, newIcon] of Object.entries(replacements)) {
  content = content.replace(oldIcon, newIcon);
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed empty logos for the visible integrations");
