const fs = require('fs');
const path = require('path');

const CLOUD_DIR = path.join(__dirname, 'cloud_sovereign_repos');
const providers = fs.existsSync(CLOUD_DIR) ? fs.readdirSync(CLOUD_DIR).filter(f => fs.statSync(path.join(CLOUD_DIR, f)).isDirectory()) : [];

let totalScanned = 0;
let totalScrubbed = 0;

function checkLicense(repoPath) {
    const files = fs.readdirSync(repoPath);
    const licenseFiles = files.filter(f => f.toLowerCase().includes('license') || f.toLowerCase() === 'copying');
    
    if (licenseFiles.length === 0) {
        // sometimes no license file is explicitly tracked in root, but we assume it might be embedded. 
        // under strict hard law, no license file = failure.
        return { isCompliant: false, reason: 'No explicit LICENSE file found in root' };
    }
    
    // Read all license files
    let combinedLicenseText = '';
    for (const lf of licenseFiles) {
        const filePath = path.join(repoPath, lf);
        if (fs.statSync(filePath).isFile()) {
            combinedLicenseText += fs.readFileSync(filePath, 'utf-8');
        }
    }
    
    const text = combinedLicenseText.toLowerCase();
    
    // Heuristics for pure MIT / Apache 2.0
    const hasMIT = text.includes('mit license') || text.includes('permission is hereby granted, free of charge, to any person obtaining a copy') || text.includes('the mit license');
    const hasApache = text.includes('apache license') && text.includes('version 2.0');
    
    // Look for bad keywords and forbidden licenses
    const hasGPL = text.includes('gnu general') || /\bgpl\b/.test(text) || text.includes('gnu public') || text.includes('gnu affero');
    const hasBSD = text.includes('bsd-style') || text.includes('bsd license') || (text.includes('redistribution and use in source and binary forms') && !hasApache);
    const hasMozilla = text.includes('mozilla public') || /\bmpl\b/.test(text);
    const hasEPL = text.includes('eclipse public') || /\bepl\b/.test(text);
    const hasCDDL = text.includes('common development and distribution');
    const hasCreativeCommons = text.includes('creative commons') || /\bcc-by\b/.test(text);
    const isProprietary = text.includes('all rights reserved') && !hasMIT && !hasApache;
    
    const isMixed = hasMIT && hasApache;
    
    if (isMixed) {
        return { isCompliant: false, reason: 'Mixed MIT and Apache 2.0 licenses' };
    }
    if (hasGPL) {
        return { isCompliant: false, reason: 'Contains GPL license components' };
    }
    if (hasBSD) {
        return { isCompliant: false, reason: 'Contains BSD license components' };
    }
    if (hasMozilla || hasEPL || hasCDDL || hasCreativeCommons) {
        return { isCompliant: false, reason: 'Contains unauthorized open source licenses (MPL/EPL/CDDL/CC)' };
    }
    if (isProprietary) {
        return { isCompliant: false, reason: 'Proprietary or All Rights Reserved clause detected' };
    }
    
    if (hasMIT) {
        return { isCompliant: true, reason: 'Pure MIT' };
    }
    if (hasApache) {
        return { isCompliant: true, reason: 'Pure Apache 2.0' };
    }
    
    return { isCompliant: false, reason: 'Could not explicitly verify pure MIT or Apache 2.0' };
}

function processProvider(provider) {
    const providerPath = path.join(CLOUD_DIR, provider);
    if (!fs.existsSync(providerPath)) return;
    
    const repos = fs.readdirSync(providerPath);
    for (const repo of repos) {
        const repoPath = path.join(providerPath, repo);
        if (!fs.statSync(repoPath).isDirectory()) continue;
        
        // Skip hidden folders
        if (repo.startsWith('.')) continue;
        
        totalScanned++;
        const result = checkLicense(repoPath);
        
        if (!result.isCompliant) {
            console.log(`[SCRUBBED] ${provider}/${repo} - Violation: ${result.reason}`);
            try {
                fs.rmSync(repoPath, { recursive: true, force: true });
                totalScrubbed++;
            } catch (e) {
                console.error(`Failed to delete ${repoPath}: ${e.message}`);
            }
        }
    }
}

console.log('Initiating Hard Law Deep Scan & Scrub Engine...');
for (const p of providers) {
    processProvider(p);
}

console.log(`\n================================`);
console.log(`HARD LAW SCAN COMPLETE`);
console.log(`================================`);
console.log(`Total Repositories Audited: ${totalScanned}`);
console.log(`Total Violations Scrubbed:  ${totalScrubbed}`);
console.log(`Remaining 100% Compliant:   ${totalScanned - totalScrubbed}`);
console.log(`================================`);
