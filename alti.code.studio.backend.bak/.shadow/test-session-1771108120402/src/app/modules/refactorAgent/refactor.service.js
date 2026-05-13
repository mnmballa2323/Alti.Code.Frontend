
import { z } from 'zod';
import { logger } from '../../../shared/logger.js';
import { jobQueueService } from '../../../shared/jobQueue.service.js';
import { treeSitterService } from './treeSitter.service.js';
import { refactorRequestSchema } from '../../../shared/schemas.js';

class RefactorService {
    constructor() {
        this.queueName = 'refactor-tasks';
        this.init();
    }

    async init() {
        await jobQueueService.ensureReady();
        // Register a worker for this queue
        // In a real microservice, the worker might be a separate process.
        // For this monolith-style app, we'll attach it here.
        jobQueueService.registerWorker(this.queueName, this.processJob.bind(this));
        logger.info('🤖 RefactorService: Initialized and listening for jobs');
    }

    /**
     * Submit a new refactor task
     * @param {object} payload 
     */
    async submitTask(payload) {
        try {
            // 1. Validate payload
            const validated = refactorRequestSchema.parse(payload);

            // 2. Add to Queue
            const job = await jobQueueService.addJob(this.queueName, 'refactor.request', validated);
            logger.info(`🤖 RefactorService: Task submitted (Job ID: ${job.id})`);
            return { jobId: job.id, status: 'queued' };

        } catch (error) {
            logger.error('🤖 RefactorService: Validation Failed', error);
            throw error;
        }
    }

    /**
     * Worker function to process the job
     * @param {object} job 
     */
    async processJob(job) {
        const { filePaths, instruction } = job.data;
        logger.info(`🤖 RefactorService: Processing job ${job.id} - "${instruction}"`);

        // Mock processing steps using our tools
        try {

            for (const filePath of filePaths) {
                // In reality: const code = fs.readFileSync(filePath, 'utf8');
                // Mock code for demonstration
                const mockCode = `function oldName() { return 1; }`;

                // 1. Analyze with Tree-sitter
                await treeSitterService.init();
                const tree = await treeSitterService.parse(mockCode);
                logger.info(`   - Parsed ${filePath}: Root node type is '${tree.rootNode.type}'`);

                // 2. "Refactor" (Mock)
                // Here we would use tree traversal to find nodes and replace text
                logger.info(`   - Applying transformation: ${instruction}`);
            }

            logger.info(`🤖 RefactorService: Job ${job.id} Completed Successfully`);
            return { result: 'success', details: `Refactored ${filePaths.length} files` };

        } catch (error) {
            logger.error(`🤖 RefactorService: Job ${job.id} Failed`, error);
            throw error;
        }
    }
}

export const refactorService = new RefactorService();
