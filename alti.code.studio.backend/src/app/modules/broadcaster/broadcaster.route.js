import express from 'express';
import { broadcasterController } from './broadcaster.controller.js';

const router = express.Router();

router.post('/slack', broadcasterController.sendSlack);
router.post('/discord', broadcasterController.sendDiscord);
router.post('/email', broadcasterController.sendEmail);
router.post('/broadcast', broadcasterController.broadcast);

export const broadcasterRoutes = router;
