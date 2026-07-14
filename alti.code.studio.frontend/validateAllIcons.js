const fs = require('fs');
const https = require('https');

function checkIconExists(prefix, name) {
  return new Promise((resolve) => {
    https.get(`https://api.iconify.design/${prefix}/${name}.svg`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function run() {
  let content = fs.readFileSync('app/team/teamData.ts', 'utf8');
  const regex = /icon:\s*"([^"]+)"/g;
  
  let match;
  let iconsToCheck = new Set();
  while ((match = regex.exec(content)) !== null) {
    if (match[1].startsWith('logos:') || match[1].startsWith('simple-icons:')) {
      iconsToCheck.add(match[1]);
    }
  }

  console.log(`Validating ${iconsToCheck.size} icons...`);
  let invalidIcons = [];

  for (const icon of iconsToCheck) {
    const parts = icon.split(':');
    if (parts.length === 2) {
      const exists = await checkIconExists(parts[0], parts[1]);
      if (!exists) {
        invalidIcons.push(icon);
      }
    }
  }

  if (invalidIcons.length === 0) {
    console.log("All icons valid!");
    return;
  }

  console.log("Found invalid icons:", invalidIcons);
  for (const icon of invalidIcons) {
    content = content.replace(new RegExp(`icon:\\s*"${icon}"`, 'g'), `icon: "solar:plug-circle-bold-duotone"`);
  }

  fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
  console.log("Fixed invalid icons!");
}

run();
