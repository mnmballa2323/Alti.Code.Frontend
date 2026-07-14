const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// The objects in our array have `id: "some-id",`
// We will parse through and rename duplicates.
const idsSeen = new Set();
let newContent = "";
let lastIndex = 0;

const regex = /id:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  let id = match[1];
  let originalMatch = match[0];
  
  if (id === "string") {
    // skip the interface definition
    newContent += content.substring(lastIndex, match.index) + originalMatch;
    lastIndex = match.index + originalMatch.length;
    continue;
  }
  
  if (idsSeen.has(id)) {
    // Duplicate found! We will append a random suffix to make it unique
    const uniqueId = id + "-" + Math.random().toString(36).substr(2, 5);
    newContent += content.substring(lastIndex, match.index) + `id: "${uniqueId}"`;
  } else {
    idsSeen.add(id);
    newContent += content.substring(lastIndex, match.index) + originalMatch;
  }
  
  lastIndex = match.index + originalMatch.length;
}

newContent += content.substring(lastIndex);
fs.writeFileSync('app/team/teamData.ts', newContent, 'utf8');
console.log("Made all IDs unique.");
