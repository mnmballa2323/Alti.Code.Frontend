const fs = require('fs');

const content = fs.readFileSync('app/team/teamData.ts', 'utf8');

const prefix = content.substring(0, content.indexOf('export const teamMembers'));
const arrayStart = content.indexOf('[', content.indexOf('export const teamMembers'));

let objects = [];
let depth = 0;
let currentObjectStart = -1;

for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === '{') {
    if (depth === 0) currentObjectStart = i;
    depth++;
  } else if (content[i] === '}') {
    depth--;
    if (depth === 0 && currentObjectStart !== -1) {
      objects.push(content.substring(currentObjectStart, i + 1));
    }
  }
}

// Keep everything that is NOT type: "language"
const filteredObjects = objects.filter(obj => !obj.includes('type: "language"'));

const targetLanguages = [
  "C", "C++", "C#", "Java", "JavaScript", "TypeScript", "Python", "Go", "Rust", 
  "Swift", "Kotlin", "Objective-C", "PHP", "Ruby", "Dart", "Scala", "R", "MATLAB", 
  "Julia", "SQL", "Bash", "PowerShell", "Perl", "Lua", "Groovy", "Elixir", "Erlang", 
  "Clojure", "Haskell", "F#", "Visual Basic", "VBA", "Assembly", "COBOL", "Fortran", 
  "Solidity", "Ada", "Apex", "ABAP", "Delphi", "Verilog", "VHDL"
];

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

const newLanguageObjects = targetLanguages.map(lang => {
  return `{
    id: "${toId(lang)}-expert",
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
});

const finalArray = [...newLanguageObjects, ...filteredObjects].join(',\n  ');

const newContent = content.substring(0, arrayStart + 1) + '\n  ' + finalArray + '\n];\n';

fs.writeFileSync('app/team/teamData.ts', newContent, 'utf8');
console.log(`Removed old languages. Added ${targetLanguages.length} specific languages. Kept ${filteredObjects.length} other items.`);
