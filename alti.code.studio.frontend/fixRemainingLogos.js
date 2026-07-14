const fs = require('fs');
let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const replacements = {
  'icon: "arcticons:workday"': 'icon: "https://icon.horse/icon/workday.com"',
  'icon: "cbi:ovhcloud"': 'icon: "https://icon.horse/icon/ovhcloud.com"',
  'icon: "cib:oracle-netsuite"': 'icon: "https://icon.horse/icon/netsuite.com"',
  'icon: "material-icon-theme:zeabur"': 'icon: "https://icon.horse/icon/zeabur.com"',
  'icon: "mdi:apache-kafka"': 'icon: "https://icon.horse/icon/kafka.apache.org"',
  'icon: "mynaui:x-solid"': 'icon: "https://icon.horse/icon/x.com"',
  'icon: "selfhst:storj"': 'icon: "https://icon.horse/icon/storj.io"',
  'icon: "solar:gamepad-bold-duotone"': 'icon: "https://icon.horse/icon/defold.com"'
};

for (const [oldIcon, newIcon] of Object.entries(replacements)) {
  content = content.replace(new RegExp(oldIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newIcon);
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed the final remaining app logos!");
