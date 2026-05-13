
import fs from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function log(msg, success = true) {
    console.log(`${success ? GREEN + '✅' : RED + '❌'} ${msg}${RESET}`);
}

function checkFile(filePath, contentChecks = []) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        log(`File not found: ${filePath}`, false);
        return false;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    let allPass = true;
    for (const check of contentChecks) {
        if (!content.includes(check)) {
            log(`File ${filePath} missing expected content: "${check}"`, false);
            allPass = false;
        }
    }

    if (allPass) log(`Verified ${filePath}`);
    return allPass;
}

console.log('🏗️  Verifying Infrastructure Configuration...\n');

let success = true;

// 1. Kubernetes
success &= checkFile('k8s/deployment.yaml', ['kind: Deployment', 'image: alti-code-studio-backend', 'replicas: 3']);
success &= checkFile('k8s/service.yaml', ['kind: Service', 'type: LoadBalancer', 'port: 80']);

// 2. Docker Compose
success &= checkFile('docker-compose.prod.yml', [
    'services:',
    'alti-backend:',
    'redis:',
    'prometheus:',
    'grafana:',
    'jaeger:'
]);

// 3. Observability
success &= checkFile('monitoring/prometheus.yml', ['scrape_configs:', 'job_name: \'alti-backend\'']);
success &= checkFile('monitoring/grafana/datasources.yml', ['datasources:', 'type: prometheus', 'type: jaeger']);

if (success) {
    console.log(`\n${GREEN}🚀 Infrastructure Configuration Verified! Ready for Deployment.${RESET}`);
    process.exit(0);
} else {
    console.log(`\n${RED}💥 Verification Failed. Check logs.${RESET}`);
    process.exit(1);
}
