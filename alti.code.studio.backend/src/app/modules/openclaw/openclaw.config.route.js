import express from 'express';
import { openclawProxyService } from './openclaw.proxy.service.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/openclaw/config:
 *   post:
 *     summary: Configure Moltworker Edge Connection
 *     description: Switches the OpenClaw execution target from localhost to a Cloudflare Worker.
 *     tags: [OpenClaw]
 */
router.post('/config', (req, res) => {
    const { url, token } = req.body;
    openclawProxyService.configureMoltworker(url, token);
    return res.status(200).json({
        success: true,
        message: 'OpenClaw execution proxy successfully updated.',
        target: url || 'localhost'
    });
});

export const openclawRoutes = router;
