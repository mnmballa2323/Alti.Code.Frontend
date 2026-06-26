/**
 * Steering Controller
 */
import { steeringService } from './steering.service.js';
import { logger } from '../../../shared/logger.js';

class SteeringController {
  async listSteering(req, res) {
    try {
      const files = await steeringService.listSteering();
      res.json({ success: true, count: files.length, files });
    } catch (err) {
      logger.error(`[SteeringController] listSteering: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }

  async createSteering(req, res) {
    try {
      const { name, content, scope, inclusion, filePatterns } = req.body;
      const file = await steeringService.createSteering(name, content, {
        scope,
        inclusion,
        filePatterns,
      });
      res.status(201).json({ success: true, file });
    } catch (err) {
      logger.error(`[SteeringController] createSteering: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  }

  async getSteering(req, res) {
    try {
      const file = await steeringService.getSteering(req.params.filename);
      res.json({ success: true, file });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async updateSteering(req, res) {
    try {
      const { content, ...metaPatch } = req.body;
      const file = await steeringService.updateSteering(
        req.params.filename,
        content,
        metaPatch,
      );
      res.json({ success: true, file });
    } catch (err) {
      logger.error(`[SteeringController] updateSteering: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }

  async deleteSteering(req, res) {
    try {
      await steeringService.deleteSteering(req.params.filename);
      res.json({
        success: true,
        message: `Steering file ${req.params.filename} deleted.`,
      });
    } catch (err) {
      logger.error(`[SteeringController] deleteSteering: ${err.message}`);
      res.status(404).json({ error: err.message });
    }
  }

  async getActiveContext(req, res) {
    try {
      const context = await steeringService.getActiveContext({
        currentFile: req.query.file,
        userPrompt: req.query.prompt,
        manualIncludes: req.query.manual ? req.query.manual.split(',') : [],
      });
      res.json({ success: true, context });
    } catch (err) {
      logger.error(`[SteeringController] getActiveContext: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }

  async initDefaults(req, res) {
    try {
      await steeringService.initDefaults();
      res.json({
        success: true,
        message: 'Default steering files initialized.',
      });
    } catch (err) {
      logger.error(`[SteeringController] initDefaults: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }
}

export const steeringController = new SteeringController();
