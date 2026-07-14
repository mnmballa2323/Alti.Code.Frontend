const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const replacements = {
  'icon: "mdi:credit-card"': 'icon: "simple-icons:braintree"',
  'icon: "mdi:email-fast"': 'icon: "simple-icons:brevo"',
  'icon: "mdi:video-wireless"': 'icon: "simple-icons:agora"',
  'icon: "mdi:phone-in-talk"': 'icon: "simple-icons:aircall"',
  'icon: "mdi:flask"': 'icon: "simple-icons:alchemy"'
};

for (const [oldIcon, newIcon] of Object.entries(replacements)) {
  content = content.replace(oldIcon, newIcon);
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed logos to use official simple-icons");
