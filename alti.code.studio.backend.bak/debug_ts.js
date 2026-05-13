
import { treeSitterService } from './src/app/modules/refactorAgent/treeSitter.service.js';

console.log('treeSitterService:', treeSitterService);
console.log('keys:', Object.keys(treeSitterService));
console.log('proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(treeSitterService)));
console.log('ensureReady type:', typeof treeSitterService.ensureReady);

async function run() {
    try {
        await treeSitterService.ensureReady();
        console.log('ensureReady executed successfully');
    } catch (e) {
        console.error('ensureReady failed:', e);
    }
}

run();
