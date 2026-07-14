const fs = require('fs');
const https = require('https');

function checkImage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function run() {
  let content = fs.readFileSync('app/team/teamData.ts', 'utf8');
  const regex = /name:\s*"([^"]+) Specialist AI"[\s\S]*?icon:\s*"solar:plug-circle-bold-duotone"/g;
  
  let match;
  let matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      name: match[1],
      fullMatch: match[0]
    });
  }

  console.log(`Found ${matches.length} generic icons to try on Clearbit...`);

  for (const item of matches) {
    let rawName = item.name.toLowerCase().replace(/ /g, '');
    let domainsToTry = [];
    
    // Check if name already has a TLD (like Daily.co, Customer.io, Builder.io)
    if (rawName.includes('.')) {
      domainsToTry.push(rawName);
    } else {
      domainsToTry.push(`${rawName}.com`);
      domainsToTry.push(`${rawName}.io`);
      domainsToTry.push(`${rawName}.co`);
      domainsToTry.push(`${rawName}.app`);
    }

    let foundUrl = null;
    for (const domain of domainsToTry) {
      const url = `https://logo.clearbit.com/${domain}`;
      const exists = await checkImage(url);
      if (exists) {
        foundUrl = url;
        break;
      }
    }
    
    if (foundUrl) {
      console.log(`Mapped ${item.name} -> ${foundUrl}`);
      content = content.replace(item.fullMatch, item.fullMatch.replace('solar:plug-circle-bold-duotone', foundUrl));
    } else {
      console.log(`Still failed for ${item.name}`);
    }
  }

  fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
  console.log("Done updating Clearbit logos!");
}

run();
