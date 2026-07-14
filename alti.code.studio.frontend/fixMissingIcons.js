const fs = require('fs');

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// Fix IDs that became duplicates
content = content.replace(/id: "c-expert",\s+name: "C\+\+ Specialist AI"/g, 'id: "cpp-expert",\n    name: "C++ Specialist AI"');
content = content.replace(/id: "c-expert",\s+name: "C# Specialist AI"/g, 'id: "csharp-expert",\n    name: "C# Specialist AI"');
content = content.replace(/id: "f-expert",\s+name: "F# Specialist AI"/g, 'id: "fsharp-expert",\n    name: "F# Specialist AI"');

// Fix missing icons
content = content.replace(/icon: "vscode-icons:file-type-abap"/g, 'icon: "simple-icons:sap"');
content = content.replace(/icon: "logos:elixir"/g, 'icon: "skill-icons:elixir-dark"');
content = content.replace(/icon: "logos:f-sharp"/g, 'icon: "devicon:fsharp"');

// Fix UI Name of F#
// Because getLanguageDisplayName uses the switch or the first part of ID, if ID is fsharp-expert, it will display "Fsharp" by default.
// But we already have `case "fsharp-lang-expert": return "F#";` in page.tsx, let's just make the ID fsharp-lang-expert
content = content.replace(/id: "fsharp-expert",\s+name: "F# Specialist AI"/g, 'id: "fsharp-lang-expert",\n    name: "F# Specialist AI"');

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Fixed missing icons and duplicate IDs.");
