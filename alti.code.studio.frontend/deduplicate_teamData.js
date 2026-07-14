const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// The array starts after `export const teamMembers: TeamMember[] = [`
// We can find all object blocks.
const blocks = [];
const blockRegex = /\{\s*id:[\s\S]*?(?=\},\n\s*\{|\}\n\])/g;
let newContent = content;

const seenNames = new Set();
let match;

// We will do a manual pass over the file to remove duplicate blocks
let lines = content.split('\n');
let filteredLines = [];
let insideObject = false;
let currentObjectLines = [];
let currentName = "";

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.trim() === "{" && lines[i+1] && lines[i+1].includes("id:")) {
    insideObject = true;
    currentObjectLines = [line];
    currentName = "";
  } else if (insideObject) {
    currentObjectLines.push(line);
    if (line.includes('name:')) {
      const match = line.match(/name:\s*"([^"]+)"/);
      if (match) currentName = match[1];
    }
    
    if (line.trim() === "}," || line.trim() === "}") {
      insideObject = false;
      if (currentName && seenNames.has(currentName)) {
        // Skip adding this object to filteredLines!
        console.log("Removing duplicate:", currentName);
      } else {
        if (currentName) seenNames.add(currentName);
        filteredLines.push(...currentObjectLines);
      }
    }
  } else {
    filteredLines.push(line);
  }
}

fs.writeFileSync('app/team/teamData.ts', filteredLines.join('\n'), 'utf8');
