const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// 1. Fix types for Mobile Apps
const mobileApps = ["React Native", "Flutter", "Ionic", "Cordova", "Capacitor", "NativeScript", "Xamarin"];
mobileApps.forEach(app => {
  const nameStr = `name: "${app} Specialist AI"`;
  let idx = content.indexOf(nameStr);
  if (idx !== -1) {
    const typeIdx = content.indexOf('type: "framework"', idx);
    if (typeIdx !== -1 && typeIdx < idx + 200) {
      content = content.substring(0, typeIdx) + 'type: "mobile"' + content.substring(typeIdx + 17);
    }
  }
});

// 2. Fix types for Game Dev
const gameEngines = ["Unreal Engine", "Godot", "Phaser"];
gameEngines.forEach(engine => {
  const nameStr = `name: "${engine} Specialist AI"`;
  let idx = content.indexOf(nameStr);
  if (idx !== -1) {
    const typeIdx = content.indexOf('type: "framework"', idx);
    if (typeIdx !== -1 && typeIdx < idx + 200) {
      content = content.substring(0, typeIdx) + 'type: "gamedev"' + content.substring(typeIdx + 17);
    }
  }
});

// 3. Fix logos for missing ones
const logoFixes = {
  "Android SDK Specialist AI": "devicon:android",
  "SwiftUI Specialist AI": "devicon:swift",
  "AgentShield Specialist AI": "solar:shield-bold-duotone",
  "Ethical Hacker AI": "solar:hacker-bold-duotone" // or let's use solar:ghost-bold-duotone, actually solar:mask-bold works better
};

// Update logo loop
for (const [name, icon] of Object.entries(logoFixes)) {
  const nameStr = `name: "${name}",`;
  let idx = content.indexOf(nameStr);
  if (idx === -1) {
    // try without comma
    idx = content.indexOf(`name: "${name}"`);
  }
  
  if (idx !== -1) {
    const iconIdx = content.indexOf('icon: ', idx);
    const objEndIdx = content.indexOf('},', idx);
    if (iconIdx !== -1 && iconIdx < objEndIdx) {
      const lineEndIdx = content.indexOf('\n', iconIdx);
      content = content.substring(0, iconIdx) + `icon: "${icon}",` + content.substring(lineEndIdx);
    }
  }
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed types and logos");
