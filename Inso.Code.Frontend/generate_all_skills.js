const fs = require('fs');

const allSkills = [
  // Browsers & Tools
  { id: "chrome-devtools", name: "Chrome DevTools", category: "Debugging", color: "#4285F4" },
  { id: "android-cli", name: "Android SDK", category: "Mobile", color: "#3DDC84" },
  { id: "firecrawl", name: "Firecrawl", category: "Scraping", color: "#FF4500" },
  { id: "exa", name: "Exa Search", category: "Search", color: "#000000" },
  
  // Smart Contracts / Web3
  { id: "solidity", name: "Solidity", category: "Web3", color: "#363636" },
  { id: "vyper", name: "Vyper", category: "Web3", color: "#000000" },
  { id: "ethereum", name: "Ethereum", category: "Web3", color: "#3C3C3D" },
  
  // Frontend
  { id: "react", name: "React", category: "Frontend", color: "#61DAFB" },
  { id: "nextjs", name: "Next.js", category: "Frontend", color: "#000000" },
  { id: "vuejs", name: "Vue.js", category: "Frontend", color: "#4FC08D" },
  { id: "playwright", name: "Playwright", category: "Testing", color: "#2EAD33" },
  
  // Backend & Frameworks
  { id: "django", name: "Django", category: "Backend", color: "#092E20" },
  { id: "fastapi", name: "FastAPI", category: "Backend", color: "#009688" },
  { id: "laravel", name: "Laravel", category: "Backend", color: "#FF2D20" },
  { id: "nestjs", name: "NestJS", category: "Backend", color: "#E0234E" },
  { id: "quarkus", name: "Quarkus", category: "Backend", color: "#4695EB" },
  { id: "springboot", name: "Spring Boot", category: "Backend", color: "#6DB33F" },
  { id: "ktor", name: "Ktor", category: "Backend", color: "#0095D5" },
  
  // Mobile & Desktop
  { id: "swift", name: "Swift", category: "Mobile", color: "#F05138" },
  { id: "swiftui", name: "SwiftUI", category: "Mobile", color: "#007AFF" },
  { id: "kotlin", name: "Kotlin", category: "Mobile", color: "#7F52FF" },
  { id: "windows", name: "Windows UI", category: "Desktop", color: "#0078D6" },
  { id: "apple", name: "Apple Frameworks", category: "Mobile", color: "#000000" },
  
  // Languages
  { id: "python", name: "Python", category: "Language", color: "#3776AB" },
  { id: "go", name: "Go", category: "Language", color: "#00ADD8" },
  { id: "rust", name: "Rust", category: "Language", color: "#000000" },
  { id: "cplusplus", name: "C++", category: "Language", color: "#00599C" },
  { id: "csharp", name: "C#", category: "Language", color: "#239120" },
  { id: "fsharp", name: "F#", category: "Language", color: "#378BBA" },
  { id: "java", name: "Java", category: "Language", color: "#007396" },
  { id: "perl", name: "Perl", category: "Language", color: "#39457E" },
  { id: "typescript", name: "TypeScript", category: "Language", color: "#3178C6" },
  
  // Databases
  { id: "postgresql", name: "PostgreSQL", category: "Database", color: "#4169E1" },
  { id: "mysql", name: "MySQL", category: "Database", color: "#4479A1" },
  { id: "clickhouse", name: "ClickHouse", category: "Database", color: "#FFCC01" },
  { id: "supabase", name: "Supabase", category: "Database", color: "#3ECF8E" },
  { id: "hibernate", name: "Hibernate", category: "Database", color: "#59666C" },
  
  // APIs & SaaS
  { id: "jira", name: "Jira", category: "Productivity", color: "#0052CC" },
  { id: "x", name: "Twitter/X", category: "Social", color: "#000000" },
  { id: "github", name: "GitHub", category: "DevOps", color: "#181717" },
  { id: "linear", name: "Linear", category: "Productivity", color: "#5E6AD2" },
  
  // Scientific & Niche
  { id: "pubmed", name: "PubMed", category: "Research", color: "#1565C0" },
  { id: "uspto", name: "USPTO", category: "Legal", color: "#003366" },
  { id: "genomics", name: "Genomics", category: "Science", color: "#4CAF50" },
  { id: "nutrient", name: "Nutrient DWS", category: "Processing", color: "#FF5722" },
  
  // Networking
  { id: "cisco", name: "Cisco IOS", category: "Networking", color: "#1BA0D7" },
  { id: "bgp", name: "BGP Diagnostics", category: "Networking", color: "#333333" },
  { id: "wireguard", name: "WireGuard", category: "Networking", color: "#881798" },
  
  // ML & AI
  { id: "pytorch", name: "PyTorch", category: "Machine Learning", color: "#EE4C2C" },
  { id: "mle", name: "ML Engineering", category: "Machine Learning", color: "#00BCD4" },
  
  // Specialized Agent Protocols
  { id: "agentshield", name: "AgentShield", category: "Security", color: "#D32F2F" },
  { id: "mcp", name: "MCP Servers", category: "Integration", color: "#8E24AA" },
  { id: "plankton", name: "Plankton QA", category: "Quality", color: "#009688" },
  { id: "nanoclaw", name: "NanoClaw REPL", category: "Tooling", color: "#607D8B" }
];

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");
fileContent = fileContent.replace(/\n\];[\s\n]*$/, "");

// Add each integration, checking if it doesn't already exist to avoid duplication
allSkills.forEach(i => {
  if (!fileContent.includes(`id: "${i.id}-expert"`)) {
    const item = `,\n  {
    id: "${i.id}-expert",
    name: "${i.name} Specialist AI",
    role: "${i.name} Architect",
    type: "integration",
    category: "${i.category}",
    specialties: ["Custom Configuration", "Workflow Automation", "API Integration"],
    bio: "Manages ${i.name} workflows seamlessly, operating natively within its ecosystem.",
    status: "idle",
    statusText: "Idle",
    accentColor: "${i.color}",
    icon: "simple-icons:${i.id}",
  }`;
    fileContent += item;
  }
});

fileContent += "\n];\n";
fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log("Appended ECC specialized skills.");
