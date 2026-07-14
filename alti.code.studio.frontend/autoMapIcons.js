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
  const regex = /name:\s*"([^"]+) Specialist AI"[\s\S]*?icon:\s*"lucide:puzzle"/g;
  
  let match;
  let matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      name: match[1],
      index: match.index,
      fullMatch: match[0]
    });
  }

  console.log(`Found ${matches.length} generic icons to fix.`);
  
  for (const item of matches) {
    let slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let found = false;
    let newIcon = '';

    // Check simple-icons
    if (await checkIconExists('simple-icons', slug)) {
      found = true;
      newIcon = `simple-icons:${slug}`;
    } 
    // Try logos
    else if (await checkIconExists('logos', slug)) {
      found = true;
      newIcon = `logos:${slug}`;
    }
    else if (await checkIconExists('logos', `${slug}-icon`)) {
      found = true;
      newIcon = `logos:${slug}-icon`;
    }
    
    if (found) {
      console.log(`Mapped ${item.name} -> ${newIcon}`);
      content = content.replace(item.fullMatch, item.fullMatch.replace('lucide:puzzle', newIcon));
    } else {
      console.log(`Could not find icon for ${item.name}`);
      // Fallback to mdi generic integration
      content = content.replace(item.fullMatch, item.fullMatch.replace('lucide:puzzle', 'solar:plug-circle-bold-duotone'));
    }
  }

  fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
  console.log("Done updating icons!");
}

run();
