const fs = require('fs');
let fileContent = fs.readFileSync("app/team/teamData.ts", "utf-8");

// We'll extract the array by evaluating it. 
// Since it's a TS file with `export const teamMembers: TeamMember[] = [ ... ];`
const arrayStr = fileContent.substring(fileContent.indexOf('['), fileContent.lastIndexOf(']') + 1);
let teamMembers;
try {
  teamMembers = eval(arrayStr);
  const langs = teamMembers.filter(m => m.type === 'language');
  console.log("Found languages:", langs.map(l => l.name).join(", "));
} catch (e) {
  console.error("Failed to parse array", e.message);
}
