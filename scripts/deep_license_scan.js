/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Deep License Scanner
 * Recursively scans all submodules and every single package inside backend's node_modules
 * to enforce strictly Pure MIT or Pure Apache 2.0 licenses.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(WORKSPACE_ROOT, 'alti.code.studio.backend');
const NODE_MODULES_DIR = path.join(BACKEND_DIR, 'node_modules');

const ALLOWED_LICENSES = ['MIT', 'Apache-2.0', 'Apache 2.0', 'Apache-2.0 WITH LLVM-exception'];

function normalizeLicense(lic) {
    if (!lic) return 'UNKNOWN';
    if (typeof lic === 'object') {
        lic = lic.type || JSON.stringify(lic);
    }
    let s = lic.toString().trim();
    if (s.startsWith('(') && s.endsWith(')')) {
        s = s.slice(1, -1);
    }
    return s;
}

function checkLicense(licName) {
    const normalized = normalizeLicense(licName);
    
    // Mixture detection
    const isMixed = normalized.includes(' OR ') || 
                    normalized.includes(' AND ') || 
                    normalized.includes('/') || 
                    normalized.includes(',') || 
                    normalized.includes('&');
                    
    if (isMixed) {
        return { isCompliant: false, reason: `Mixed license: "${normalized}"` };
    }

    const isAllowed = ALLOWED_LICENSES.some(allowed => {
        return normalized.toLowerCase() === allowed.toLowerCase() ||
               normalized.toLowerCase().includes(allowed.toLowerCase());
    });

    if (!isAllowed) {
        return { isCompliant: false, reason: `Restricted license: "${normalized}"` };
    }

    return { isCompliant: true, license: normalized };
}

// Find all installed package directories recursively (handles flat and nested node_modules)
function findPackages(dir, packageMap = new Map()) {
    if (!fs.existsSync(dir)) return packageMap;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.startsWith('.')) continue;

        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue; // skip broken symlinks
        }

        if (stat.isDirectory()) {
            if (file.startsWith('@')) {
                // It's a scoped namespace, scan package folders inside it
                findPackages(fullPath, packageMap);
            } else if (fs.existsSync(path.join(fullPath, 'package.json'))) {
                // It's a package
                const pkgJsonPath = path.join(fullPath, 'package.json');
                try {
                    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                    if (pkg.name) {
                        packageMap.set(pkg.name, {
                            name: pkg.name,
                            path: fullPath,
                            license: pkg.license || 'UNKNOWN',
                            version: pkg.version || '0.0.0'
                        });
                    }
                } catch (e) {
                    // skip malformed package.json
                }
                
                // Recursively check nested node_modules inside this package
                const nestedNodeModules = path.join(fullPath, 'node_modules');
                if (fs.existsSync(nestedNodeModules)) {
                    findPackages(nestedNodeModules, packageMap);
                }
            }
        }
    }
    return packageMap;
}

function runDeepScan() {
    console.log('⚖️ INITIATING DEEP LICENSE SCAN ON ENTIRE BACKEND CODEBASE...');
    console.log(`- Backend Root: ${BACKEND_DIR}`);
    console.log(`- Policy: Strictly Pure MIT or Pure Apache 2.0 only.\n`);

    const packageMap = new Map();
    findPackages(NODE_MODULES_DIR, packageMap);

    console.log(`Discovered ${packageMap.size} unique installed npm packages (including transitive dependencies).\n`);

    let compliantCount = 0;
    let nonCompliantPackages = [];
    const licenseStats = {};

    for (const [name, pkg] of packageMap.entries()) {
        const result = checkLicense(pkg.license);
        const licName = normalizeLicense(pkg.license);

        licenseStats[licName] = (licenseStats[licName] || 0) + 1;

        if (result.isCompliant) {
            compliantCount++;
        } else {
            nonCompliantPackages.push({
                name: pkg.name,
                version: pkg.version,
                license: licName,
                path: path.relative(WORKSPACE_ROOT, pkg.path),
                reason: result.reason
            });
        }
    }

    // --- Submodules Check ---
    console.log('🔍 Auditing Submodules...');
    const gitmodulesPath = path.join(WORKSPACE_ROOT, '.gitmodules');
    const submoduleViolations = [];
    if (fs.existsSync(gitmodulesPath)) {
        const content = fs.readFileSync(gitmodulesPath, 'utf8');
        const submoduleMatches = content.match(/path = (submodules\/\S+)/g);
        if (submoduleMatches) {
            for (const match of submoduleMatches) {
                const subPath = match.replace('path = ', '').trim();
                const absoluteSubPath = path.join(WORKSPACE_ROOT, subPath);
                
                if (fs.existsSync(absoluteSubPath)) {
                    const pkgPath = path.join(absoluteSubPath, 'package.json');
                    let lic = 'UNKNOWN';
                    if (fs.existsSync(pkgPath)) {
                        try {
                            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                            lic = pkg.license || 'UNKNOWN';
                        } catch (e) {}
                    }
                    if (lic === 'UNKNOWN') {
                        // Scan root for standard license files
                        const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING', 'license', 'license.txt'];
                        for (const lf of licenseFiles) {
                            const fullLf = path.join(absoluteSubPath, lf);
                            if (fs.existsSync(fullLf)) {
                                const lContent = fs.readFileSync(fullLf, 'utf8').toLowerCase();
                                if (lContent.includes('mit license') || lContent.includes('permission is hereby granted')) {
                                    lic = 'MIT';
                                    break;
                                } else if (lContent.includes('apache license') && lContent.includes('version 2.0')) {
                                    lic = 'Apache-2.0';
                                    break;
                                }
                            }
                        }
                    }

                    const result = checkLicense(lic);
                    if (!result.isCompliant) {
                        submoduleViolations.push({
                            name: subPath,
                            license: lic,
                            reason: result.reason
                        });
                    }
                }
            }
        }
    }

    // --- Report Output ---
    console.log('==================================================');
    console.log('             DEEP COMPLIANCE SCORECARD            ');
    console.log('==================================================');
    console.log(`- Compliant Packages (MIT/Apache-2.0): ${compliantCount} / ${packageMap.size} (${((compliantCount / packageMap.size) * 100).toFixed(1)}%)`);
    console.log(`- Non-Compliant Packages (Other licenses): ${nonCompliantPackages.length}\n`);

    console.log('📊 License Breakdown Across All Dependencies:');
    const sortedLicenses = Object.entries(licenseStats).sort((a, b) => b[1] - a[1]);
    for (const [lic, count] of sortedLicenses) {
        const isAllowed = ALLOWED_LICENSES.some(allowed => lic.toLowerCase().includes(allowed.toLowerCase()));
        const marker = isAllowed ? '✅' : '⚠️';
        console.log(`  ${marker} ${lic}: ${count} packages`);
    }

    if (submoduleViolations.length > 0) {
        console.log('\n🚨 Non-Compliant Submodules detected:');
        for (const sub of submoduleViolations) {
            console.log(`  ❌ [${sub.name}]: License: ${sub.license} (${sub.reason})`);
        }
    } else {
        console.log('\n✅ All Git submodules strictly comply with the Pure MIT / Pure Apache 2.0 policy!');
    }

    if (nonCompliantPackages.length > 0) {
        console.log(`\n🚨 Non-Compliant Dependency list (${nonCompliantPackages.length} packages):`);
        // Group by license for clean display
        const grouped = {};
        for (const pkg of nonCompliantPackages) {
            grouped[pkg.license] = grouped[pkg.license] || [];
            grouped[pkg.license].push(`${pkg.name}@${pkg.version}`);
        }

        for (const [lic, pkgs] of Object.entries(grouped)) {
            console.log(`\n  License: [${lic}] (${pkgs.length} packages):`);
            // Show up to 10 packages per license to keep output readable, otherwise summarize
            const displayPkgs = pkgs.slice(0, 10);
            for (const p of displayPkgs) {
                console.log(`    - ${p}`);
            }
            if (pkgs.length > 10) {
                console.log(`    - ... and ${pkgs.length - 10} more.`);
            }
        }
    } else {
        console.log('\n🎉 100% PERFECT DEEP COMPLIANCE! Every single installed dependency and submodule is purely MIT or Apache-2.0.');
    }
    
    console.log('\n==================================================');
}

runDeepScan();
