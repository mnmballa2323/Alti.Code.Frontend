import multer from 'multer';
import { acousticWorkspaceService } from './acoustic_workspace.service.js';
import { logger } from '../../../shared/logger.js';

// Configure multer for memory storage 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max audio capture
});

export const acousticWorkspaceRouter = (app) => {
    logger.info('🎧 Mounting Acoustic Workspace Endpoint...');

    app.post('/api/internal/acoustic-workspace', upload.single('audio'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No audio file provided in FormData' });
            }

            const result = await acousticWorkspaceService.processAudioCommand(req.file.buffer);
            res.status(200).json(result);
        } catch (error) {
            logger.error(`Acoustic Workspace API Error: ${error.message}`);
            res.status(500).json({ error: error.message || 'Transcription failed' });
        }
    });
};
