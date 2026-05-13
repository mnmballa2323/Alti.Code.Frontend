/**
 * Undo Controller
 */
import { undoService } from './undo.service.js';

class UndoController {
    getHistory(req, res) {
        const { sessionId } = req.params;
        const history = undoService.getHistory(sessionId);
        res.json({ success: true, count: history.length, history });
    }

    getEntry(req, res) {
        const entry = undoService.getEntry(req.params.sessionId, req.params.entryId);
        if (!entry) return res.status(404).json({ error: 'Entry not found.' });
        res.json({ success: true, entry });
    }

    async undoLast(req, res) {
        try {
            const result = await undoService.undoLast(req.params.sessionId);
            res.json({ success: true, ...result });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    async undoFile(req, res) {
        try {
            const { filePath } = req.body;
            if (!filePath) return res.status(400).json({ error: 'filePath required.' });
            const result = await undoService.undoFile(req.params.sessionId, filePath);
            res.json({ success: true, ...result });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    async undoAll(req, res) {
        try {
            const result = await undoService.undoAll(req.params.sessionId);
            res.json({ success: true, ...result });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    clearSession(req, res) {
        undoService.clearSession(req.params.sessionId);
        res.json({ success: true, message: 'History cleared.' });
    }
}

export const undoController = new UndoController();
