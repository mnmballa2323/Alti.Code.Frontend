/**
 * Powers Controller
 */
import { powersService } from './powers.service.js';
import { logger } from '../../../shared/logger.js';

class PowersController {
    async listAvailable(req, res) {
        try {
            const powers = await powersService.listAvailablePowers();
            res.json({ success: true, count: powers.length, powers });
        } catch (err) {
            logger.error(`[PowersController] listAvailable: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    async listInstalled(req, res) {
        try {
            const powers = await powersService.getInstalledPowers();
            res.json({ success: true, count: powers.length, powers });
        } catch (err) {
            logger.error(`[PowersController] listInstalled: ${err.message}`);
            res.status(500).json({ error: err.message });
        }
    }

    async getPowerDetails(req, res) {
        try {
            const power = await powersService.getPowerDetails(req.params.id);
            res.json({ success: true, power });
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }

    async installPower(req, res) {
        try {
            const result = await powersService.installPower(req.params.id);
            res.status(201).json(result);
        } catch (err) {
            logger.error(`[PowersController] installPower: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    }

    async uninstallPower(req, res) {
        try {
            const result = await powersService.uninstallPower(req.params.id);
            res.json(result);
        } catch (err) {
            logger.error(`[PowersController] uninstallPower: ${err.message}`);
            res.status(400).json({ error: err.message });
        }
    }
}

export const powersController = new PowersController();
