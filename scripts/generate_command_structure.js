const fs = require('fs');
const path = require('path');

const workspaces = [
  '/Users/michaelmeram/workspace/alti.code.studio',
  '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend'
];

const generals = [
  { id: 'frontend-general', name: 'General of Frontend Architecture', domain: 'UI/UX, React, Browsers, CSS, Client-side' },
  { id: 'backend-general', name: 'General of Backend Infrastructure', domain: 'Node.js, Express, Postgres, APIs' },
  { id: 'security-general', name: 'General of Cyber Security', domain: 'Zero-Trust, AppSec, Vulnerability Scanning' },
  { id: 'devops-general', name: 'General of DevOps & Cloud Orchestration', domain: 'Docker, Kubernetes, Automation' },
  { id: 'qa-general', name: 'General of Autonomous QA', domain: 'Testing, Fuzzing, E2E, Unit Tests' },
  { id: 'data-science-general', name: 'General of Data Science', domain: 'Machine Learning, Analytics, Pandas' },
  { id: 'mobile-general', name: 'General of Mobile Platforms', domain: 'iOS, Android, React Native, Flutter' },
  { id: 'platform-general', name: 'General of Platform Engineering', domain: 'Internal Tooling, Self-Service, Portals' },
  { id: 'marketing-general', name: 'General of Growth & SEO', domain: 'Marketing, Analytics, SEO Optimization' },
  { id: 'finops-general', name: 'General of Cloud FinOps', domain: 'Cost Optimization, Telemetry, Auditing' },
  { id: 'ai-general', name: 'General of AI & Foundational Models', domain: 'LLMs, Neural Networks, Agentic Systems' },
  { id: 'web3-general', name: 'General of Web3 & Blockchain', domain: 'Smart Contracts, Solidity, Cryptography' },
  { id: 'embedded-general', name: 'General of Embedded Systems', domain: 'IoT, C, C++, Rust, Hardware Drivers' },
  { id: 'game-dev-general', name: 'General of Game Development', domain: 'Unity, Unreal Engine, WebGL, Shaders' },
  { id: 'database-general', name: 'General of Database Architecture', domain: 'SQL, NoSQL, Graph DBs, Indexing' },
  { id: 'network-general', name: 'General of Network Engineering', domain: 'TCP/IP, BGP, Routers, DNS' },
  { id: 'api-general', name: 'General of API Design', domain: 'GraphQL, REST, gRPC, Schema Design' },
  { id: 'sre-general', name: 'General of Site Reliability', domain: 'SRE, Incident Response, Uptime, PagerDuty' },
  { id: 'crypto-general', name: 'General of Applied Cryptography', domain: 'Encryption, Zero-Knowledge Proofs' },
  { id: 'a11y-general', name: 'General of Accessibility', domain: 'a11y, WCAG Compliance, Screen Readers' },
  { id: 'performance-general', name: 'General of Performance', domain: 'Core Web Vitals, Memory Profiling' },
  { id: 'oss-general', name: 'General of Open Source Strategy', domain: 'Licensing, OSS Integration, Community' },
  { id: 'cloud-arch-general', name: 'General of Azure Cloud Architecture', domain: 'Azure, Hybrid Cloud, Enterprise Design' },
  { id: 'design-general', name: 'General of UI/UX Design', domain: 'Figma, Tailwind, Design Systems' },
  { id: 'data-eng-general', name: 'General of Data Engineering', domain: 'ETL Pipelines, Kafka, Spark, Hadoop' },
  { id: 'quant-general', name: 'General of High-Frequency Systems', domain: 'Low-latency, Quant Trading, C++' },
  { id: 'robotics-general', name: 'General of Robotics & Autonomous Systems', domain: 'ROS, Drones, Self-Driving, Kinematics' },
  { id: 'quantum-general', name: 'General of Quantum Computing', domain: 'Qiskit, Shor Algorithm, Quantum Entanglement' },
  { id: 'bioinfo-general', name: 'General of Bioinformatics', domain: 'Genomics, Proteomics, Computational Biology' },
  { id: 'spatial-general', name: 'General of Spatial Computing', domain: 'AR, VR, VisionOS, WebXR' },
  { id: 'cv-general', name: 'General of Computer Vision', domain: 'OpenCV, Object Detection, Image Processing' },
  { id: 'nlp-general', name: 'General of Natural Language Processing', domain: 'NLP, Speech-to-Text, Sentiment Analysis' },
  { id: 'red-team-general', name: 'General of Offensive Security', domain: 'Penetration Testing, Red Teaming, Exploits' },
  { id: 'iam-general', name: 'General of Identity & Access Management', domain: 'IAM, OAuth, SAML, SSO' },
  { id: 'compliance-general', name: 'General of Governance & Compliance', domain: 'SOC2, HIPAA, GDPR, Audits' },
  { id: 'erp-general', name: 'General of Enterprise Systems', domain: 'SAP, Salesforce, Workday, ERP' },
  { id: 'cicd-general', name: 'General of CI/CD Pipelines', domain: 'Jenkins, GitHub Actions, GitLab CI' },
  { id: 'edge-general', name: 'General of Edge Computing', domain: 'Cloudflare, Fastly, CDN, Edge Workers' },
  { id: 'os-dev-general', name: 'General of Operating Systems', domain: 'Linux Kernel, Windows Internals, POSIX' },
  { id: 'compilers-general', name: 'General of Compilers & Languages', domain: 'LLVM, Parsers, Lexers, ASTs' },
  { id: 'graphics-general', name: 'General of 3D Graphics Programming', domain: 'Vulkan, OpenGL, DirectX, Raytracing' },
  { id: 'audio-general', name: 'General of Audio Engineering', domain: 'DSP, WebAudio, Signal Processing' },
  { id: 'defi-general', name: 'General of Decentralized Finance', domain: 'DeFi, Tokenomics, Liquidity Pools' },
  { id: 'nocode-general', name: 'General of Low-Code Platforms', domain: 'Zapier, Bubble, Make, Retool' },
  { id: 'search-general', name: 'General of Search & Retrieval', domain: 'Elasticsearch, Algolia, Lucene' },
  { id: 'mainframe-general', name: 'General of Legacy Systems', domain: 'Mainframe, COBOL, Fortran, IBM Z' },
  { id: 'tech-writing-general', name: 'General of Technical Documentation', domain: 'DITA, Sphinx, Markdown, Swagger' },
  { id: 'hardware-general', name: 'General of Hardware Design', domain: 'FPGA, Verilog, VHDL, ASIC' },
  { id: 'systems-prog-general', name: 'General of Systems Programming', domain: 'Rust, Go, C, Memory Safety' },
  { id: 'info-arch-general', name: 'General of Information Architecture', domain: 'Ontologies, Taxonomies, Knowledge Graphs' },
  { id: 'forensics-general', name: 'General of Digital Forensics & Blue Team', domain: 'Malware Analysis, Incident Response, SIEM' },
  { id: 'mlops-general', name: 'General of MLOps & Model Deployment', domain: 'Triton, TensorRT, Model Monitoring, Serving' },
  { id: 'distributed-general', name: 'General of Distributed Systems Theory', domain: 'Consensus, Raft, Paxos, CAP Theorem' },
  { id: 'microservices-general', name: 'General of Microservices Architecture', domain: 'Service Mesh, Istio, Event-Driven' },
  { id: 'local-first-general', name: 'General of Local-First Software', domain: 'CRDTs, Offline-First, IndexedDB, Sync' },
  { id: 'wasm-general', name: 'General of WebAssembly', domain: 'Wasm, Emscripten, Browser VMs' },
  { id: 'rtc-general', name: 'General of Real-Time Communications', domain: 'WebRTC, SIP, VoIP, Streaming Protocols' },
  { id: 'virtualization-general', name: 'General of Virtualization', domain: 'KVM, QEMU, VMware, Hypervisors' },
  { id: 'dr-general', name: 'General of Disaster Recovery', domain: 'Backups, Failover, Multi-Region Routing' },
  { id: 'dx-general', name: 'General of Developer Experience', domain: 'CLI Tools, Linters, Formatters, LSPs' }
];

const colonelsPerGeneral = 5;

function createProfile(id, name, description, tier, model) {
  return `---
name: ${id}
title: ${name}
tier: ${tier}
description: ${description}
model: ${model}
tools: ["Delegate", "Read", "Write"]
---
# Directives
You are ${name}, a ${tier} in the Alti Code Studio autonomous swarm.
Your primary responsibility is to reason about the user's objective and securely delegate tasks down the chain of command using the 'Delegate' tool.
DO NOT execute manual file modifications unless absolutely necessary. Rely on your subordinate ranks.
`;
}

function run() {
  console.log("Generating 4-Tier Military Command Structure...");

  workspaces.forEach(workspace => {
    const hierarchyDir = path.join(workspace, '.agent', 'hierarchy');
    fs.mkdirSync(path.join(hierarchyDir, 'generals'), { recursive: true });
    fs.mkdirSync(path.join(hierarchyDir, 'colonels'), { recursive: true });

    // 1. Supreme Commander (Superintendent)
    const commanderMd = createProfile(
      'supreme-commander',
      'The Supreme Commander',
      'The highest tier orchestrator. Analyzes raw user input and delegates exclusively to 4-Star Domain Generals.',
      'Tier-1-Commander',
      'gemini-3.1-pro'
    );
    fs.writeFileSync(path.join(hierarchyDir, 'supreme-commander.md'), commanderMd);

    // 2. Generals & Colonels
    let colonelIndex = 0;
    generals.forEach(general => {
      const generalMd = createProfile(
        general.id,
        general.name,
        `4-Star General overseeing the ${general.domain} domain. Delegates to specialized Colonels.`,
        'Tier-2-General',
        'gemini-3.1-pro'
      );
      fs.writeFileSync(path.join(hierarchyDir, 'generals', `${general.id}.md`), generalMd);

      // 3. Colonels (Crew Leads)
      for (let i = 0; i < colonelsPerGeneral; i++) {
        colonelIndex++;
        const colonelId = `${general.id}-colonel-${i+1}`;
        const colonelMd = createProfile(
          colonelId,
          `${general.name} Colonel ${i+1}`,
          `Mid-tier manager (Crew Lead) for ${general.domain}. Deploys squads of micro-agents (the Infantry) from the 50,000 catalog to execute specific technical tasks.`,
          'Tier-3-Colonel',
          'gemini-3.5-flash-high'
        );
        fs.writeFileSync(path.join(hierarchyDir, 'colonels', `${colonelId}.md`), colonelMd);
      }
    });
  });

  console.log("Successfully generated:");
  console.log("- 1 Supreme Commander");
  console.log(`- ${generals.length} Domain Generals`);
  console.log(`- ${generals.length * colonelsPerGeneral} Specialized Colonels`);
}

run();
