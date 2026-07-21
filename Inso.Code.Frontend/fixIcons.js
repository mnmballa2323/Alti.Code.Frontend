const fs = require('fs');

const iconMap = {
  "C": "logos:c",
  "C++": "logos:c-plusplus",
  "C#": "logos:c-sharp",
  "Java": "logos:java",
  "JavaScript": "logos:javascript",
  "TypeScript": "logos:typescript-icon",
  "Python": "logos:python",
  "Go": "logos:go",
  "Rust": "logos:rust",
  "Swift": "logos:swift",
  "Kotlin": "logos:kotlin-icon",
  "Objective-C": "vscode-icons:file-type-objectivec",
  "PHP": "logos:php",
  "Ruby": "logos:ruby",
  "Dart": "logos:dart",
  "Scala": "logos:scala",
  "R": "logos:r-lang",
  "MATLAB": "vscode-icons:file-type-matlab",
  "Julia": "logos:julia",
  "SQL": "vscode-icons:file-type-sql",
  "Bash": "logos:bash-icon",
  "PowerShell": "vscode-icons:file-type-powershell",
  "Perl": "logos:perl",
  "Lua": "logos:lua",
  "Groovy": "vscode-icons:file-type-groovy",
  "Elixir": "logos:elixir",
  "Erlang": "logos:erlang",
  "Clojure": "logos:clojure",
  "Haskell": "logos:haskell-icon",
  "F#": "logos:f-sharp",
  "Visual Basic": "vscode-icons:file-type-vb",
  "VBA": "vscode-icons:file-type-vba",
  "Assembly": "vscode-icons:file-type-assembly",
  "COBOL": "vscode-icons:file-type-cobol",
  "Fortran": "vscode-icons:file-type-fortran",
  "Solidity": "logos:solidity",
  "Ada": "file-icons:ada",
  "Apex": "vscode-icons:file-type-apex",
  "ABAP": "vscode-icons:file-type-abap",
  "Delphi": "vscode-icons:file-type-delphi",
  "Verilog": "vscode-icons:file-type-verilog",
  "VHDL": "vscode-icons:file-type-vhdl"
};

let content = fs.readFileSync('app/team/teamData.ts', 'utf8');

// The objects in our array have predictable `name: "X Specialist AI"`
for (const [lang, icon] of Object.entries(iconMap)) {
  const nameStr = `name: "${lang} Specialist AI"`;
  
  // Find index of nameStr
  let startIndex = 0;
  while (true) {
    const nameIdx = content.indexOf(nameStr, startIndex);
    if (nameIdx === -1) break;
    
    // Find the next 'icon: "lucide:code"' after this name
    const iconIdx = content.indexOf('icon: "lucide:code"', nameIdx);
    
    // Find the end of this object '},'
    const objEndIdx = content.indexOf('},', nameIdx);
    
    // Check if the icon belongs to this object
    if (iconIdx !== -1 && iconIdx < objEndIdx) {
      // Replace it
      const before = content.substring(0, iconIdx);
      const after = content.substring(iconIdx + 19); // 19 is length of icon: "lucide:code"
      content = before + `icon: "${icon}"` + after;
    }
    
    startIndex = nameIdx + nameStr.length;
  }
}

fs.writeFileSync('app/team/teamData.ts', content, 'utf8');
console.log("Updated icons");
