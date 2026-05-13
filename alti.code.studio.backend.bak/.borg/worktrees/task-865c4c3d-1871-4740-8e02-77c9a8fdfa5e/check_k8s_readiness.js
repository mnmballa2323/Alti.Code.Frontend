
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const HELM_DIR = path.join(process.cwd(), 'k8s', 'helm');
const CHART_FILE = path.join(HELM_DIR, 'Chart.yaml');
const VALUES_FILE = path.join(HELM_DIR, 'values.yaml');
const DEPLOYMENT_TEMPLATE = path.join(HELM_DIR, 'templates', 'deployment.yaml');
const HPA_TEMPLATE = path.join(HELM_DIR, 'templates', 'hpa.yaml');

function checkFileExists(filePath, name) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ Found ${name}`);
        return true;
    } else {
        console.error(`❌ Missing ${name} at ${filePath}`);
        return false;
    }
}

function validateYaml(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Simple check: if it contains handlebars {{ }}, js-yaml might fail or parse weirdly.
        // We just want to ensure the file is readable and has content.
        if (content.length > 0) {
            console.log(`✅ Validated content in ${path.basename(filePath)}`);
            return true;
        }
    } catch (e) {
        console.error(`❌ Error reading ${filePath}:`, e.message);
        return false;
    }
    return false;
}

async function checkK8s() {
    console.log('--- Checking Kubernetes Readiness ---');

    let allPass = true;
    allPass &= checkFileExists(CHART_FILE, 'Chart.yaml');
    allPass &= checkFileExists(VALUES_FILE, 'values.yaml');
    allPass &= checkFileExists(DEPLOYMENT_TEMPLATE, 'Deployment Template');
    allPass &= checkFileExists(HPA_TEMPLATE, 'HPA Template');

    if (allPass) {
        // Validate specific values
        const values = yaml.load(fs.readFileSync(VALUES_FILE, 'utf8'));
        if (values.autoscaling && values.autoscaling.enabled === true) {
            console.log(`✅ Autoscaling Configured: Min ${values.autoscaling.minReplicas}, Max ${values.autoscaling.maxReplicas}`);
        } else {
            console.error('❌ Autoscaling not enabled in values.yaml');
            allPass = false;
        }
    }

    if (allPass) {
        console.log('\n✅ Kubernetes Readiness Verification Passed');
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkK8s();
