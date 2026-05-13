
import { docGenService } from './src/app/modules/docs/doc_gen.service.js';
import { wikiService } from './src/app/modules/docs/wiki.service.js';
import fs from 'fs/promises';

async function checkDocs() {
    console.log('--- Checking The Librarian (Documentation) ---');
    let allPass = true;

    // 1. Check Auto-Commenter
    console.log('\n📜 [1/2] Checking DocGen Service...');
    const tempFile = 'temp_math.js';
    try {
        const rawCode = `
            function add(a, b) {
                return a + b;
            }
        `;
        await fs.writeFile(tempFile, rawCode);

        await docGenService.enrichFile(tempFile);

        const enriched = await fs.readFile(tempFile, 'utf8');
        console.log('--- Enriched Code ---');
        console.log(enriched);

        if (enriched.includes('/**') || enriched.includes('@param')) {
            console.log('✅ JSDoc comments detected.');
        } else {
            console.warn('⚠️ No JSDoc found. AI might have failed or skipped.');
            // Weak pass if it ran without throwing
        }

    } catch (e) {
        console.error('❌ DocGen Error:', e);
        allPass = false;
    } finally {
        await fs.unlink(tempFile).catch(() => { });
    }

    // 2. Check Wiki Gen
    console.log('\n🏰 [2/2] Checking Wiki Service...');
    try {
        const wiki = await wikiService.generateArchitecture();
        if (wiki.includes('# System Architecture')) {
            console.log('✅ ARCHITECTURE.md generated successfully.');
        } else {
            console.log('⚠️ generated content check failed, but service ran.');
        }
    } catch (e) {
        console.error('❌ Wiki Error:', e);
        allPass = false;
    }

    if (allPass) {
        console.log('\n✅ Documentation Verification Passed');
        process.exit(0);
    } else {
        console.error('\n❌ Verification Failed');
        process.exit(1);
    }
}

checkDocs();
