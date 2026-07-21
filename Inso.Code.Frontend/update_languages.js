const fs = require('fs');
const path = require('path');

const targetLanguages = [
  { id: "javascript", name: "JavaScript", desc: "ES6/Node.js event loops, promises, dynamic scopes, and ecosystem tools." },
  { id: "typescript", name: "TypeScript", desc: "Strict-mode interfaces, mapped types, advanced generics, and tsconfig optimizations." },
  { id: "python", name: "Python", desc: "Async FastAPI, Django, type-safe Pydantic models, data science pipelines, and packaging." },
  { id: "java", name: "Java", desc: "JVM runtime optimization, virtual threads, records, sealed classes, and Spring Boot 3." },
  { id: "cpp", name: "C++", desc: "Modern C++23 template metaprogramming, RAII safety, STL concurrency, and memory management." },
  { id: "csharp", name: "C#", desc: "C# 12/.NET 8 async workflows, LINQ queries, EF Core database mappings, and ASP.NET Core." },
  { id: "golang", name: "Go", desc: "Goroutines, CSP channels, standard library microservices, and gRPC communication protocols." },
  { id: "c", name: "C", desc: "Low-level procedural system programming, manual memory allocators, POSIX wrappers, and compiler flags." },
  { id: "php", name: "PHP", desc: "Modern PHP 8.3 OOP structures, Laravel web framework pipelines, and Pest testing." },
  { id: "ruby", name: "Ruby", desc: "Rails backend convention structures, ActiveRecord queries, metaprogramming, and RSpec." },
  { id: "swift", name: "Swift", desc: "SwiftUI mobile interfaces, Swift 6 actor model concurrency, and native Apple runtimes." },
  { id: "kotlin", name: "Kotlin", desc: "Android JVM application runtimes, Coroutines, Flow structures, and Kotlin Multiplatform (KMP)." },
  { id: "sql", name: "SQL", desc: "Relational database querying: advanced CTEs, window functions, query plans, and index strategies." },
  { id: "bash", name: "Bash", desc: "Shell automation pipelines, command-line system scripting, and container automation." },
  { id: "rust", name: "Rust", desc: "Memory safety guarantees without garbage collection, borrow checker semantics, lifetimes, and cargo packaging." }
];

console.log(`Configured ${targetLanguages.length} core market languages.`);

// 2. Read frontend teamData.ts
const teamDataPath = path.join(__dirname, 'app', 'team', 'teamData.ts');
const content = fs.readFileSync(teamDataPath, 'utf8');

const prefix = content.substring(0, content.indexOf('export const teamMembers'));
const arrayStart = content.indexOf('[', content.indexOf('=', content.indexOf('export const teamMembers')));

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
const filteredObjects = objects.filter(obj => !obj.includes('type: "language"') && !obj.includes('category: "Language"'));

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

function getIconForLanguage(name) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const specialMaps = {
    c: 'logos:c',
    cpp: 'logos:c-plusplus',
    csharp: 'logos:c-sharp',
    java: 'logos:java',
    javascript: 'logos:javascript',
    typescript: 'logos:typescript-icon',
    python: 'logos:python',
    go: 'logos:go',
    rust: 'logos:rust',
    swift: 'logos:swift',
    kotlin: 'logos:kotlin-icon',
    objectivec: 'vscode-icons:file-type-objectivec',
    php: 'logos:php',
    ruby: 'logos:ruby',
    dart: 'logos:dart',
    scala: 'logos:scala',
    rlang: 'logos:r-lang',
    matlab: 'vscode-icons:file-type-matlab',
    julia: 'logos:julia',
    sql: 'vscode-icons:file-type-sql',
    bash: 'logos:bash-icon',
    powershell: 'vscode-icons:file-type-powershell',
    perl: 'logos:perl',
    lua: 'logos:lua',
    groovy: 'vscode-icons:file-type-groovy',
    elixir: 'skill-icons:elixir-dark',
    erlang: 'logos:erlang',
    clojure: 'logos:clojure',
    haskell: 'logos:haskell-icon',
    fsharp: 'devicon:fsharp',
    visualbasic: 'vscode-icons:file-type-vb',
    vba: 'vscode-icons:file-type-vba',
    assembly: 'vscode-icons:file-type-assembly',
    cobol: 'vscode-icons:file-type-cobol',
    fortran: 'vscode-icons:file-type-fortran',
    solidity: 'logos:solidity',
    ada: 'file-icons:ada',
    apex: 'vscode-icons:file-type-apex',
    abap: 'simple-icons:sap',
    delphi: 'vscode-icons:file-type-delphi',
    verilog: 'vscode-icons:file-type-verilog',
    vhdl: 'vscode-icons:file-type-vhdl',
    webassemblywat: 'logos:webassembly',
    webassembly: 'logos:webassembly',
    ansibleyaml: 'logos:ansible',
    ansible: 'logos:ansible',
    dockerfile: 'logos:docker',
    hcl: 'logos:terraform',
    terraform: 'logos:terraform',
    nix: 'logos:nixos',
    yaml: 'vscode-icons:file-type-yaml',
    jsonnet: 'vscode-icons:file-type-json',
    graphql: 'logos:graphql',
    markdown: 'logos:markdown',
  };
  return specialMaps[normalized] || 'lucide:code';
}

const newLanguageObjects = targetLanguages.map(lang => {
  const cleanName = lang.name;
  const cleanDesc = lang.desc.replace(/"/g, '\\"');
  return `{
    id: "${lang.id}-expert",
    name: "${cleanName}",
    role: "${cleanName} Engineer",
    type: "language",
    category: "Language",
    specialties: ["Syntax Analysis", "Compilation", "Idiomatic Code"],
    bio: "Expertly writes, analyzes, and refactors ${cleanName} code for ${cleanDesc}",
    status: "idle",
    statusText: "Idle",
    accentColor: "${getRandomColor()}",
    icon: "${getIconForLanguage(cleanName)}",
  }`;
});

const finalArray = [...newLanguageObjects, ...filteredObjects].join(',\n  ');

const newContent = content.substring(0, arrayStart + 1) + '\n  ' + finalArray + '\n];\n';

fs.writeFileSync(teamDataPath, newContent, 'utf8');
console.log(`Updated languages! Added exactly ${targetLanguages.length} core market language specialists. Kept ${filteredObjects.length} other team members.`);
