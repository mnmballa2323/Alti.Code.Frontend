/**
 * Hooks Controller
 */
import { hooksService } from './hooks.service.js';
import { logger } from '../../../shared/logger.js';

class HooksController {
  async listHooks(req, res) {
    try {
      const hooks = await hooksService.listHooks();
      res.json({ success: true, count: hooks.length, hooks });
    } catch (err) {
      logger.error(`[HooksController] listHooks: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }

  async createHook(req, res) {
    try {
      const hook = await hooksService.createHook(req.body);
      res.status(201).json({ success: true, hook });
    } catch (err) {
      logger.error(`[HooksController] createHook: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  }

  async getHook(req, res) {
    try {
      const hook = await hooksService.getHook(req.params.id);
      res.json({ success: true, hook });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async updateHook(req, res) {
    try {
      const hook = await hooksService.updateHook(req.params.id, req.body);
      res.json({ success: true, hook });
    } catch (err) {
      logger.error(`[HooksController] updateHook: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  }

  async deleteHook(req, res) {
    try {
      await hooksService.deleteHook(req.params.id);
      res.json({ success: true, message: `Hook ${req.params.id} deleted.` });
    } catch (err) {
      logger.error(`[HooksController] deleteHook: ${err.message}`);
      res.status(404).json({ error: err.message });
    }
  }

  async fireHook(req, res) {
    try {
      const result = await hooksService.fireHookById(
        req.params.id,
        req.body || {},
      );
      res.json({ success: true, result });
    } catch (err) {
      logger.error(`[HooksController] fireHook: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }

  async triggerEvent(req, res) {
    try {
      const { eventType, context } = req.body;
      if (!eventType)
        return res.status(400).json({ error: '"eventType" is required.' });
      const results = await hooksService.triggerEvent(eventType, context || {});
      res.json({ success: true, results });
    } catch (err) {
      logger.error(`[HooksController] triggerEvent: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }
}

export const hooksController = new HooksController();
