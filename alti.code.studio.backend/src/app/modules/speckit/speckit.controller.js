/**
 * SpecKit Controller — Kiro-style 3-phase spec-driven development
 */

import { specKitService } from './speckit.service.js';
import { logger } from '../../../shared/logger.js';

class SpecKitController {

    // POST /specs  — Phase 1: Create spec + requirements
    async createSpec(req, res) {
        try {
            const { request, regions } = req.body;
            if (!request) return res.status(400).json({ error: '"request" is required.' });
            const result = await specKitService.createSpec(request, regions);
            res.status(201).json({ success: true, ...result });
        } catch (err) {
            logger.error(`[SpecKitController] createSpec: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // GET /specs — list all specs
    async listSpecs(req, res) {
        try {
            const specs = await specKitService.listSpecs();
            res.json({ success: true, count: specs.length, specs });
        } catch (err) {
            logger.error(`[SpecKitController] listSpecs: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // GET /specs/:id — get full spec state
    async getSpec(req, res) {
        try {
            const spec = await specKitService.getSpec(req.params.id);
            res.json({ success: true, spec });
        } catch (err) {
            logger.error(`[SpecKitController] getSpec: ${err.message}`);
            res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
        }
    }

    // POST /specs/:id/design — Phase 2: generate design.md
    async createDesign(req, res) {
        try {
            const { regions } = req.body || {};
            const result = await specKitService.createDesign(req.params.id, regions);
            res.json({ success: true, ...result });
        } catch (err) {
            logger.error(`[SpecKitController] createDesign: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // POST /specs/:id/tasks — Phase 3: generate tasks.md
    async createTasks(req, res) {
        try {
            const result = await specKitService.createTasks(req.params.id);
            res.json({ success: true, ...result });
        } catch (err) {
            logger.error(`[SpecKitController] createTasks: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // POST /specs/:id/tasks/:idx/execute — execute a single task
    async executeTask(req, res) {
        try {
            const taskIndex = parseInt(req.params.idx, 10);
            if (isNaN(taskIndex) || taskIndex < 0) {
                return res.status(400).json({ error: 'Invalid task index.' });
            }
            const result = await specKitService.executeTask(req.params.id, taskIndex);
            res.json({ success: true, ...result });
        } catch (err) {
            logger.error(`[SpecKitController] executeTask: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // POST /specs/bugfix — create bugfix spec
    async createBugfixSpec(req, res) {
        try {
            const { bugDescription, currentBehavior, expectedBehavior, stepsToReproduce } = req.body;
            if (!bugDescription) return res.status(400).json({ error: '"bugDescription" is required.' });
            const result = await specKitService.createBugfixSpec(bugDescription, {
                currentBehavior,
                expectedBehavior,
                stepsToReproduce,
            });
            res.status(201).json({ success: true, ...result });
        } catch (err) {
            logger.error(`[SpecKitController] createBugfixSpec: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    // DELETE /specs/:id — delete spec
    async deleteSpec(req, res) {
        try {
            await specKitService.deleteSpec(req.params.id);
            res.json({ success: true, message: `Spec ${req.params.id} deleted.` });
        } catch (err) {
            logger.error(`[SpecKitController] deleteSpec: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }
}

export const specKitController = new SpecKitController();
