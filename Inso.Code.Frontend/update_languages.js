const fs = require('fs');

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");

// Change types for non-languages
const nonLanguages = ['config-expert', 'graphql-expert', 'terraform-expert', 'plc-expert', 'gcode-expert', 'labview-expert'];

nonLanguages.forEach(id => {
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?type:\\s*)"language"`);
  fileContent = fileContent.replace(regex, `$1"integration"`);
});

// Add missing languages
const missingLangs = [
  { id: "dart", name: "Dart", color: "#0175C2" },
  { id: "elm", name: "Elm", color: "#60B5CC" },
  { id: "crystal", name: "Crystal", color: "#000000" },
  { id: "hack", name: "Hack", color: "#878787" },
  { id: "apl", name: "APL", color: "#5995ED" },
  { id: "v", name: "V", color: "#4F87C4" },
  { id: "reason", name: "ReasonML", color: "#DD4B39" },
  { id: "idris", name: "Idris", color: "#000000" },
  { id: "scratch", name: "Scratch", color: "#4D97FF" }
];

fileContent = fileContent.replace(/\n\];[\s\n]*$/, "");

missingLangs.forEach(lang => {
  if (!fileContent.includes(`id: "${lang.id}-expert"`)) {
    const item = `,\n  {
    id: "${lang.id}-expert",
    name: "${lang.name} Specialist AI",
    role: "${lang.name} Engineer",
    type: "language",
    category: "Language",
    specialties: ["Syntax Analysis", "Compilation", "Idiomatic Code"],
    bio: "Expertly writes, analyzes, and refactors ${lang.name} code.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${lang.color}",
    icon: "lucide:code",
  }`;
    fileContent += item;
  }
});

fileContent += "\n];\n";
fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log("Updated languages.");
