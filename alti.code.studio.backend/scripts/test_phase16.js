
import { refactorService } from '../src/app/modules/refactorAgent/refactor.service.js';
import { codeMorphService } from '../src/app/modules/refactorAgent/codeMorph.service.js';
import fs from 'fs/promises';
import path from 'path';

async function verifyPhase16() {
    console.log("🚀 Testing Phase 16: The Perfectionist...");

    const testDir = path.join(process.cwd(), 'temp_phase16');
    await fs.mkdir(testDir, { recursive: true });

    try {
        // --- TEST 1: COMPLEXITY SCAN ---
        console.log("\n📊 Testing Complexity Scan...");

        const complexFile = path.join(testDir, 'complex.js');
        let spaghetti = "function hell() {\n";
        for (let i = 0; i < 15; i++) {
            spaghetti += "  if (true) {\n    if (true) { console.log('nested'); }\n  }\n";
        }
        spaghetti += "}";
        await fs.writeFile(complexFile, spaghetti);

        const analysis = await refactorService.scanComplexity(testDir);
        console.log("Complexity Report:", JSON.stringify(analysis, null, 2));

        if (analysis.length === 0) throw new Error("Failed to detect complex file.");
        console.log("✅ Complexity Detection works.");


        // --- TEST 2: ORGANIZE IMPORTS ---
        console.log("\n✨ Testing Organize Imports...");

        const messyImportsFile = path.join(testDir, 'messy.ts');
        const messyCode = `
            import { z } from 'zod';
            import fs from 'fs';
            import { a } from './local';
            
            export const foo = () => { console.log(z, fs, a); };
        `;
        // Note: ts-morph organize imports usually sorts: lib, then absolute, then relative.
        // It should re-order 'fs' before 'zod' or keeps them if already sorted but might combine.
        // Let's force a disorder or just verify it runs without error and changes text if needed.
        // actually ts-morph organize imports is powerful. 

        const sourceFile = codeMorphService.addSourceFile(messyImportsFile, messyCode);
        codeMorphService.organizeImports(sourceFile);

        const result = codeMorphService.getSource(sourceFile);
        console.log("Organized Code:\n", result);

        if (!result.includes('import fs from')) throw new Error("Code lost imports during organization.");

        console.log("✅ Organize Imports executed.");

        console.log("\n✅ Phase 16 Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        // Cleanup
        // await fs.rm(testDir, { recursive: true, force: true });
    }
}

verifyPhase16();
