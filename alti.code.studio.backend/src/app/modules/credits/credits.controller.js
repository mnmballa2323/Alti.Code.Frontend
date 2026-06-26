/**
 * Credits Controller
 */
import { creditTrackingService } from './credits.service.js';
import { logger } from '../../../shared/logger.js';

class CreditsController {
  getGlobal(req, res) {
    const stats = creditTrackingService.getGlobalStats();
    res.json({ success: true, stats });
  }

  getAllSessions(req, res) {
    const sessions = creditTrackingService.getAllSessions();
    res.json({ success: true, count: sessions.length, sessions });
  }

  getSession(req, res) {
    const session = creditTrackingService.getSession(req.params.sessionId);
    res.json({ success: true, session });
  }

  resetSession(req, res) {
    creditTrackingService.resetSession(req.params.sessionId);
    res.json({
      success: true,
      message: `Session ${req.params.sessionId} reset.`,
    });
  }
}

export const creditsController = new CreditsController();
