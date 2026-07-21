const fs = require('fs');
const path = require('path');

const targetClouds = [
  {
    id: "amazonaws-expert",
    name: "AWS",
    role: "AWS Architect",
    type: "devops",
    category: "Cloud",
    specialties: ["API Integration", "Webhooks", "SDK Configuration"],
    bio: "Integrates and configures AWS services into your application.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#232F3E",
    icon: "logos:aws"
  },
  {
    id: "googlecloud-expert",
    name: "Google Cloud",
    role: "Google Cloud Architect",
    type: "devops",
    category: "Cloud",
    specialties: ["API Integration", "Webhooks", "SDK Configuration"],
    bio: "Integrates and configures Google Cloud services into your application.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#4285F4",
    icon: "simple-icons:googlecloud"
  },
  {
    id: "microsoftazure-expert",
    name: "Microsoft Azure",
    role: "Microsoft Azure Architect",
    type: "devops",
    category: "Cloud",
    specialties: ["API Integration", "Webhooks", "SDK Configuration"],
    bio: "Integrates and configures Microsoft Azure services into your application.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#0089D6",
    icon: "simple-icons:microsoftazure"
  },
  {
    id: "alibaba-cloud-expert",
    name: "Alibaba Cloud",
    role: "Alibaba Cloud Architect",
    type: "cloud",
    category: "Cloud",
    specialties: ["ECS & ACK", "Infrastructure", "Scaling"],
    bio: "Provisions and maintains robust systems on Alibaba Cloud.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#FF6600",
    icon: "simple-icons:alibabacloud"
  },
  {
    id: "oracle-cloud-expert",
    name: "Oracle Cloud",
    role: "OCI Database Dev",
    type: "cloud",
    category: "Cloud",
    specialties: ["Autonomous DB", "Oracle APEX", "Bare Metal"],
    bio: "Maintains high-performance Oracle Cloud Infrastructure (OCI) and enterprise databases.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#F80000",
    icon: "logos:oracle"
  },
  {
    id: "ibm-cloud-expert",
    name: "IBM Cloud Systems",
    role: "IBM Cloud Architect",
    type: "cloud",
    category: "Cloud",
    specialties: ["Watson AI", "Db2", "Red Hat OpenShift"],
    bio: "Deploys hybrid cloud solutions utilizing IBM Cloud and enterprise-grade data services.",
    status: "idle",
    statusText: "Idle",
    accentColor: "#052FAD",
    icon: "logos:ibm"
  }
];

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

// Keep everything that is NOT category: "Cloud"
const filteredObjects = objects.filter(obj => !obj.includes('category: "Cloud"'));

const newCloudObjects = targetClouds.map(c => {
  return `{
    id: "${c.id}",
    name: "${c.name}",
    role: "${c.role}",
    type: "${c.type}",
    category: "${c.category}",
    specialties: ${JSON.stringify(c.specialties)},
    bio: "${c.bio.replace(/"/g, '\\"')}",
    status: "${c.status}",
    statusText: "${c.statusText}",
    accentColor: "${c.accentColor}",
    icon: "${c.icon}",
  }`;
});

const finalArray = [...newCloudObjects, ...filteredObjects].join(',\n  ');

const newContent = content.substring(0, arrayStart + 1) + '\n  ' + finalArray + '\n];\n';

fs.writeFileSync(teamDataPath, newContent, 'utf8');
console.log(`Updated clouds! Added exactly ${targetClouds.length} cloud specialists. Kept ${filteredObjects.length} other team members.`);
