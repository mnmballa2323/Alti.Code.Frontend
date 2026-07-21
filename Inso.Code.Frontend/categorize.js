const fs = require('fs');

let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");

// 1. Update the TeamMember type definition
fileContent = fileContent.replace(
  /type:\s*"language"\s*\|\s*"framework"\s*\|\s*"role"\s*\|\s*"cloud"\s*\|\s*"integration";/,
  `type: "language" | "framework" | "role" | "cloud" | "integration" | "database" | "mobile" | "gamedev" | "frontend" | "backend" | "security" | "devops" | "productivity";`
);

// We need to parse and replace the types in the actual data.
// Since it's huge and we can't eval easily, we'll do regex replacement carefully.
// A typical block:
// {
//   id: "react-expert",
//   name: "React Specialist AI",
//   role: "React Architect",
//   type: "framework",
//   category: "Frontend",

fileContent = fileContent.replace(/(id:\s*"[^"]+",[\s\S]*?type:\s*)"([^"]+)"([\s\S]*?category:\s*)"([^"]+)"/g, (match, p1, p2, p3, p4) => {
  let newType = p2;
  const cat = p4.toLowerCase();
  
  if (cat.includes("database") || cat.includes("storage") || cat.includes("data")) {
    newType = "database";
  } else if (cat.includes("mobile") || cat.includes("ios") || cat.includes("android")) {
    newType = "mobile";
  } else if (cat.includes("game") || cat.includes("gaming")) {
    newType = "gamedev";
  } else if (cat.includes("security")) {
    newType = "security";
  } else if (cat.includes("frontend") || cat.includes("ui") || cat.includes("css")) {
    newType = "frontend";
  } else if (cat.includes("backend")) {
    newType = "backend";
  } else if (cat.includes("devops") || cat.includes("cloud") || cat.includes("infrastructure") || cat.includes("networking")) {
    // If it's already "cloud", leave it, else devops
    newType = p2 === "cloud" ? "cloud" : "devops";
  } else if (cat.includes("productivity") || cat.includes("communication") || cat.includes("crm") || cat.includes("collaboration") || cat.includes("customer support") || cat.includes("hr") || cat.includes("marketing")) {
    newType = "productivity";
  }
  
  return `${p1}"${newType}"${p3}"${p4}"`;
});

fs.writeFileSync("app/team/teamData.ts", fileContent, "utf-8");
console.log("Categorized team data.");
