const fs = require('fs');

const newEngines = [
  { name: "Unity", icon: "logos:unity", role: "Unity Game Developer" },
  { name: "CryEngine", icon: "simple-icons:cryengine", role: "CryEngine Developer" },
  { name: "GameMaker", icon: "simple-icons:gamemaker", role: "GameMaker Specialist" },
  { name: "Construct 3", icon: "simple-icons:construct3", role: "Construct Developer" },
  { name: "Cocos2d", icon: "simple-icons:cocos", role: "Cocos2d Specialist" },
  { name: "Defold", icon: "simple-icons:defold", role: "Defold Developer" },
  { name: "MonoGame", icon: "simple-icons:monogame", role: "MonoGame Developer" }
];

let newText = "";
for (const engine of newEngines) {
  const id = engine.name.toLowerCase().replace(/[^a-z0-9]/g, '') + "-expert-" + Math.random().toString(36).substr(2,5);
  newText += `
  {
    id: "${id}",
    name: "${engine.name} Specialist AI",
    role: "${engine.role}",
    type: "gamedev",
    category: "Game Dev",
    specialties: ["Game Logic", "Physics", "Rendering", "Optimization"],
    bio: "Expert in ${engine.name} development, specializing in gameplay, physics, and rendering optimization.",
    status: "Available",
    statusText: "Ready",
    accentColor: "#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}",
    icon: "${engine.icon}",
  },`;
}

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');
const insertPos = content.lastIndexOf('];');
if (insertPos !== -1) {
  content = content.substring(0, insertPos) + newText + '\n' + content.substring(insertPos);
  fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
  console.log("Added new Game Dev engines successfully.");
} else {
  console.log("Could not find the end of the array.");
}
