const fs = require('fs');
const path = './Inso.Code.Frontend/app/team/teamData.ts';
let content = fs.readFileSync(path, 'utf8');

// Add icon to TeamMember interface
content = content.replace(
  '  accentColor: string;\n}',
  '  accentColor: string;\n  icon?: string;\n}'
);

const roleIds = [
  'chief-architect', 'enterprise-pm', 'startup-pm', 'scrum-master',
  'release-train', 'devrel', 'tech-writer', 'business-analyst',
  'sre-lead', 'platform-expert', 'network-expert',
  'secops-expert', 'pen-tester', 'compliance-expert',
  'load-tester', 'a11y-expert',
];

const exactIcons = {
  // Languages
  'c-expert': 'devicon:c',
  'cpp-expert': 'devicon:cplusplus',
  'rust-expert': 'devicon:rust',
  'zig-expert': 'devicon:zig',
  'go-expert': 'devicon:go',
  'assembly-x86-expert': 'devicon:nasm',
  'assembly-arm-expert': 'devicon:nasm',
  'd-expert': 'vscode-icons:file-type-dlang',
  'nim-expert': 'devicon:nim',
  'carbon-expert': 'devicon:carbon',
  'mojo-expert': 'vscode-icons:file-type-mojo',
  'ts-expert': 'devicon:typescript',
  'js-expert': 'devicon:javascript',
  'python-expert': 'devicon:python',
  'php-expert': 'devicon:php',
  'ruby-expert': 'devicon:ruby',
  'perl-expert': 'devicon:perl',
  'lua-expert': 'devicon:lua',
  'tcl-expert': 'vscode-icons:file-type-tcl',
  'bash-expert': 'devicon:bash',
  'powershell-expert': 'vscode-icons:file-type-powershell',
  'java-expert': 'devicon:java',
  'csharp-expert': 'devicon:csharp',
  'kotlin-lang-expert': 'devicon:kotlin',
  'swift-lang-expert': 'devicon:swift',
  'objc-expert': 'vscode-icons:file-type-objectivec',
  'scala-expert': 'devicon:scala',
  'groovy-expert': 'devicon:groovy',
  'haskell-expert': 'devicon:haskell',
  'elixir-lang-expert': 'devicon:elixir',
  'erlang-expert': 'devicon:erlang',
  'fsharp-lang-expert': 'devicon:fsharp',
  'clojure-expert': 'devicon:clojure',
  'ocaml-expert': 'devicon:ocaml',
  'lisp-expert': 'vscode-icons:file-type-lisp',
  'prolog-expert': 'vscode-icons:file-type-prolog',
  'sql-expert': 'vscode-icons:file-type-sql',
  'r-expert': 'devicon:r',
  'julia-expert': 'devicon:julia',
  'matlab-expert': 'devicon:matlab',
  'fortran-expert': 'devicon:fortran',
  'sas-expert': 'vscode-icons:file-type-sas',
  'cobol-expert': 'devicon:cobol',
  'solidity-expert': 'devicon:solidity',
  'vyper-expert': 'devicon:vyper',
  'html-expert': 'devicon:html5',
  'css-expert': 'devicon:css3',
  'graphql-expert': 'devicon:graphql',
  'config-expert': 'logos:aws-config',
  'latex-expert': 'devicon:latex',
  'terraform-expert': 'devicon:terraform',
  'unity-expert': 'devicon:unity',
  'unreal-expert': 'devicon:unrealengine',
  'ada-expert': 'vscode-icons:file-type-ada',
  'delphi-expert': 'devicon:delphi',
  'vb-expert': 'vscode-icons:file-type-vb',
  'plsql-expert': 'vscode-icons:file-type-plsql',
  'abap-expert': 'logos:sap',
  'vhdl-expert': 'vscode-icons:file-type-vhdl',
  'plc-expert': 'mdi:robot-industrial',
  'gcode-expert': 'mdi:printer-3d',
  'labview-expert': 'vscode-icons:file-type-labview',
  'actionscript-expert': 'mdi:flash',
  'coldfusion-expert': 'vscode-icons:file-type-cf',
  'racket-expert': 'mdi:lambda',
  'smalltalk-expert': 'mdi:chat-processing-outline',
  'apex-expert': 'logos:salesforce',
  'pascal-expert': 'vscode-icons:file-type-pascal',
  'verilog-expert': 'vscode-icons:file-type-vhdl',

  // Roles
  'chief-architect': 'mdi:account-tie',
  'enterprise-pm': 'mdi:briefcase',
  'startup-pm': 'mdi:rocket-launch',
  'scrum-master': 'mdi:view-dashboard',
  'release-train': 'mdi:train',
  'devrel': 'mdi:account-group',
  'tech-writer': 'mdi:file-document-edit',
  'business-analyst': 'mdi:chart-bar',
  'sre-lead': 'mdi:alert-decagram',
  'platform-expert': 'mdi:server-network',
  'linux-kernel-expert': 'devicon:linux',
  'win32-expert': 'devicon:windows8',
  'network-expert': 'mdi:router-wireless',
  'secops-expert': 'mdi:shield-lock',
  'pen-tester': 'mdi:hacker',
  'compliance-expert': 'mdi:file-check',
  'tdd-expert': 'mdi:test-tube',
  'load-tester': 'mdi:speedometer',
  'a11y-expert': 'mdi:human-wheelchair',
  
  // Frameworks
  'react-lead': 'devicon:react',
  'vue-lead': 'devicon:vuejs',
  'angular-lead': 'devicon:angular',
  'svelte-expert': 'devicon:svelte',
  'solid-expert': 'devicon:solidjs',
  'ios-dev': 'devicon:swift',
  'android-dev': 'devicon:android',
  'flutter-dev': 'devicon:flutter',
  'react-native-dev': 'devicon:react',
  'perf-expert': 'mdi:lightning-bolt',
  'postgres-lead': 'devicon:postgresql',
  'mysql-lead': 'devicon:mysql',
  'clickhouse-lead': 'devicon:clickhouse',
  'nosql-lead': 'devicon:mongodb',
  'redis-lead': 'devicon:redis',
  'nestjs-lead': 'devicon:nestjs',
  'django-lead': 'devicon:django',
  'fastapi-lead': 'devicon:fastapi',
  'springboot-lead': 'devicon:spring',
  'laravel-lead': 'devicon:laravel',
  'gcp-expert': 'devicon:googlecloud',
  'k8s-expert': 'devicon:kubernetes',
  'docker-expert': 'devicon:docker',
  'cicd-expert': 'mdi:rocket-launch',
  'playwright-expert': 'logos:playwright',
  'mle-expert': 'devicon:pytorch',
  'mlops-expert': 'devicon:googlecloud',
  'rag-expert': 'devicon:python',
  'prompt-expert': 'mdi:brain',
  'quantum-expert': 'mdi:atom',
  'shopify-liquid-expert': 'logos:shopify',
  'wordpress-expert': 'devicon:wordpress',
  'webgl-expert': 'devicon:threejs',
  'webrtc-expert': 'mdi:webrtc',
  'firebase-expert': 'devicon:firebase',
  'cloudflare-workers-expert': 'devicon:cloudflare',
  'servicenow-expert': 'logos:servicenow',
  'sap-expert': 'logos:sap',
  'gis-expert': 'mdi:map-marker',
};

// Regex to find each object in the array
content = content.replace(/{\s*id:\s*"([^"]+)",([^}]+)}/g, (match, id, body) => {
  let newBody = body;
  
  if (roleIds.includes(id)) {
    newBody = newBody.replace(/type:\s*"[^"]+"/, 'type: "role"');
  } else if (!newBody.includes('type: "language"')) {
    newBody = newBody.replace(/type:\s*"[^"]+"/, 'type: "framework"');
  }

  const icon = exactIcons[id] || 'mdi:code-braces';
  // Add icon right after accentColor
  newBody = newBody.replace(/(accentColor:\s*"[^"]+",?)/, `$1\n    icon: "${icon}",`);

  return `{\n    id: "${id}",${newBody}}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log("Updated teamData.ts");
