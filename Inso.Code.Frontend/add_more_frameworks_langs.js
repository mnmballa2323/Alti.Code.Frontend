const fs = require('fs');

const newLanguages = [
  "Scheme", "AutoIt", "AutoHotkey", "VBScript", "FoxPro", "Awk", "Brainfuck", "Dylan", "Forth", "J", "Logo", "ML", "OpenCL", "PostScript", "RPG", "Standard ML", "Vala", "WebAssembly", "Solidity", "Vyper"
];

const newFrameworks = [
  // Frontend
  "Svelte", "SolidJS", "Qwik", "Preact", "Alpine.js", "Lit", "Ember.js", "Backbone.js", "Aurelia", "Meteor",
  // Backend JS/TS
  "Express", "Koa", "Hapi", "Sails", "AdonisJS", "Deno Fresh",
  // Backend Ruby/Python/Go/Elixir
  "Ruby on Rails", "Sinatra", "Hanami", "Flask", "Tornado", "Bottle", "Falcon", "Gin", "Echo", "Fiber", "Revel", "Beego", "Phoenix",
  // Backend Java/.NET
  "Spring", "Play", "Struts", "ASP.NET Core",
  // Mobile
  "React Native", "Flutter", "Ionic", "Cordova", "Capacitor", "NativeScript", "Xamarin",
  // UI / CSS
  "Tailwind CSS", "Bootstrap", "Bulma", "Foundation", "Material-UI", "Chakra UI", "Ant Design", "Semantic UI", "Vuetify",
  // Data / ML
  "TensorFlow", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Apache Spark", "Hadoop",
  // Game
  "Unity", "Unreal Engine", "Godot", "Phaser"
];

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");
fileContent = fileContent.replace(/\n\];[\s\n]*$/, "");

function toId(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

newLanguages.forEach(lang => {
  const id = toId(lang);
  if (!fileContent.includes(`id: "${id}-expert"`)) {
    fileContent += `,\n  {
    id: "${id}-expert",
    name: "${lang} Specialist AI",
    role: "${lang} Engineer",
    type: "language",
    category: "Language",
    specialties: ["Syntax Analysis", "Compilation", "Idiomatic Code"],
    bio: "Expertly writes, analyzes, and refactors ${lang} code.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${getRandomColor()}",
    icon: "lucide:code",
  }`;
  }
});

newFrameworks.forEach(fw => {
  const id = toId(fw);
  if (!fileContent.includes(`id: "${id}-expert"`)) {
    fileContent += `,\n  {
    id: "${id}-expert",
    name: "${fw} Specialist AI",
    role: "${fw} Architect",
    type: "framework",
    category: "Framework",
    specialties: ["Architecture", "Performance", "Best Practices"],
    bio: "Designs and implements robust applications using ${fw}.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${getRandomColor()}",
    icon: "lucide:layers",
  }`;
  }
});

fileContent += "\n];\n";
fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log(`Added ${newLanguages.length} languages and ${newFrameworks.length} frameworks.`);
