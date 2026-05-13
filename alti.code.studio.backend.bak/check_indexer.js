
import fs from 'fs/promises';
import path from 'path';
import { indexerService } from './src/app/modules/cortex/indexer.service.js';

async function checkIndexer() {
    console.log('🧠 Starting Cortex Indexer Verification...');

    const tempDir = './temp_repo_Verify';

    try {
        // 1. Setup Temp Repo
        try { await fs.mkdir(tempDir); } catch { }
        await fs.writeFile(path.join(tempDir, 'readme.md'), '# Hello World');
        await fs.writeFile(path.join(tempDir, 'main.js'), 'console.log("Hello");');
        console.log(`📝 Created temp repo: ${tempDir}`);

        // 2. Index It
        console.log('🕷️ Crawling and Indexing via IndexerService...');
        const result = await indexerService.indexRepo(path.resolve(tempDir));

        if (result.success && result.count >= 2) {
            console.log(`✅ Indexing Successful! Processed ${result.count} files.`);
        } else {
            console.error('❌ Indexing Failed or Incomplete:', result);
            process.exit(1);
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
            console.log('🧹 Cleanup complete');
        } catch (e) {
            console.log('Cleanup error', e);
        }
    }
}

checkIndexer();
