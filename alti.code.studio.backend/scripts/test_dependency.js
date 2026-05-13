/**
 * test_dependency.js
 *
 * Verifies that optional/enterprise logging integrations are importable.
 * Run with: node scripts/test_dependency.js
 */

const PACKAGES = [
    '@google-cloud/logging',
    'winston-elasticsearch',
    'winston-daily-rotate-file',
];

async function testDependencies() {
    const start = Date.now();
    let passed = 0;
    let failed = 0;

    console.log('🔍 Testing optional dependency availability...\n');

    for (const pkg of PACKAGES) {
        try {
            const mod = await import(pkg);
            // Confirm the module is not just an empty object
            const hasExports = mod && Object.keys(mod).length > 0;
            if (hasExports) {
                console.log(`  ✅ ${pkg} — imported successfully (${Object.keys(mod).length} exports)`);
                passed++;
            } else {
                console.warn(`  ⚠️  ${pkg} — imported but has no exports`);
                failed++;
            }
        } catch (e) {
            console.error(`  ❌ ${pkg} — FAILED: ${e.message}`);
            failed++;
        }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n--- Results: ${passed}/${PACKAGES.length} passed | Duration: ${duration}s ---\n`);

    if (failed > 0) {
        console.warn(`⚠️  ${failed} optional package(s) unavailable. Install them or disable their integrations.`);
        // Exit 0 — these are optional deps, missing ones are warnings not errors.
        process.exit(0);
    }

    console.log('ALL OPTIONAL DEPENDENCIES AVAILABLE ✅');
    process.exit(0);
}

testDependencies();
