
import { wikiService } from '../src/app/modules/docs/wiki.service.js';
import { adrService } from '../src/app/modules/docs/adr.service.js';
import fs from 'fs/promises';
import path from 'path';

const ADR_DIR = path.join(process.cwd(), 'docs', 'adr');
const BACKUP_DIR = path.join(process.cwd(), 'docs', 'adr_backup');

async function setup() {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    try {
        const files = await fs.readdir(ADR_DIR);
        for (const file of files) {
            await fs.copyFile(path.join(ADR_DIR, file), path.join(BACKUP_DIR, file));
            await fs.unlink(path.join(ADR_DIR, file));
        }
    } catch (e) {
        // Safe to ignore if docs/adr doesn't exist
    }
}

async function cleanup() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        for (const file of files) {
            await fs.mkdir(ADR_DIR, { recursive: true });
            await fs.copyFile(path.join(BACKUP_DIR, file), path.join(ADR_DIR, file));
        }
        await fs.rm(BACKUP_DIR, { recursive: true, force: true });
    } catch (e) {
        // Safe to ignore
    }
}

async function verifyPhase17() {
    console.log("🚀 Testing Phase 17: The Archivist...");
    await setup();

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
        await cleanup();
        process.exit(1);
    } finally {
        await cleanup();
    }
}

verifyPhase17();
