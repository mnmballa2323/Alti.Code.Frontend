
import { wikiService } from '../src/app/modules/docs/wiki.service.js';
import { adrService } from '../src/app/modules/docs/adr.service.js';
import fs from 'fs/promises';
import path from 'path';

async function verifyPhase17() {
    console.log("🚀 Testing Phase 17: The Archivist...");

    try {
        // --- TEST 1: DOCS SITE GEN ---
        console.log("\n🏰 Testing Wiki Site Generation...");
        await wikiService.generateDocsSite();

        const indexExists = await fs.stat('docs/index.md').catch(() => false);
        const sidebarExists = await fs.stat('docs/_sidebar.md').catch(() => false);

        if (!indexExists || !sidebarExists) throw new Error("Docs site generation failed (missing files)");
        console.log("✅ Docs folder structure created.");


        // --- TEST 2: ADR CREATION ---
        console.log("\n📜 Testing ADR Creation...");

        const adr1 = await adrService.createADR(
            "Use Node.js",
            "Accepted",
            "We need a backend.",
            "We will use Node.js.",
            "Pros: Fast. Cons: Single threaded."
        );

        console.log(`Created ADR: ${adr1.filename}`);

        if (!adr1.filename.startsWith('001-')) throw new Error("ADR numbering failed");

        const adr2 = await adrService.createADR(
            "Use MongoDB",
            "Accepted",
            "We need a DB.",
            "We use Mongo.",
            "Flexible schema."
        );
        console.log(`Created ADR: ${adr2.filename}`);

        if (!adr2.filename.startsWith('002-')) throw new Error("ADR sequential numbering failed");

        console.log("✅ ADRs generated successfully.");

        console.log("\n✅ Phase 17 Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyPhase17();
